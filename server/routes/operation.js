var express = require('express');
var mongoskin = require('mongoskin');
var config = require('../config');
var fs = require('fs');

var id = mongoskin.helper.toObjectID;
var router = express.Router();


/* GET total of each aggregation sent by the requested period and distrib */
router.post('/response-obje/:distrib', function (req, res, next) {
  try {
    var distrib = req.params.distrib;
    var files = req.body;
    files = files.map(function(file){
      file.data = file.data.join('\n');
      return file;
    });
    files.forEach(function(file){
      fs.writeFile(config.ftpRootDir+'/'+distrib+'/'+config.REINTEROBJEDISTRIB_DIR+'/'+file.filename, file.data, function (err) {
        if (err) throw err;
        console.log("It's saved");
      });
    });
    res.status(201).send('REINTEROBJEDISTRIB created.');
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});


router.get('/manual-objes-response-required/:distrib', function (req, res, next) {
  try {
    var db = mongoskin.db('mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbIp + ':' + config.dbPort
      + '/' + req.params.distrib + '-database?authSource=' + req.params.distrib + '-database', {safe: true});
    db.collection(config.inputFsCollectionName)
      .find({
        $or: [{'metadata.fileType': 'OBJEINME'}, {'metadata.fileType': '15OBJEINME'}, {'metadata.fileType': 'AOBJEAGCL'}, {'metadata.fileType': '15AOBJEAGCL'}],
        'metadata.necesitaRevisionManual': true,
        'metadata.fechaRevisionManual': {$exists: false}
      })
      .toArray(function (e, results) {
        if (e) return next(e);
        db.close();
        res.send(results);
      });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});


module.exports = router;