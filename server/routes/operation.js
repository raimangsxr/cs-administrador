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
      // fs.writeFile('/home/rromani/'+file.filename, file.data, function (err) {
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
        $or: [
          {'metadata.fileType': 'AOBJE2'}, {'metadata.fileType': '15AOBJE2'},
          {'metadata.fileType': 'AOBJEAGCL'}, {'metadata.fileType': '15AOBJEAGCL'},
          {'metadata.fileType': 'AOBJEAGRECL'}, {'metadata.fileType': '15AOBJEAGRECL'},
          {'metadata.fileType': 'AOBJEAGRERE'}, {'metadata.fileType': '15AOBJEAGRERE'},
          {'metadata.fileType': 'AOBJECIL'}, {'metadata.fileType': '15AOBJECIL'},

          // {'metadata.fileType': 'AREVCL'}, {'metadata.fileType': '15AREVCL'},
          // {'metadata.fileType': 'AREVAC'}, {'metadata.fileType': '15AREVAC'},
          // {'metadata.fileType': 'AREVAGRE'}, {'metadata.fileType': '15AREVAGRE'},
          // {'metadata.fileType': 'AREVAE'}, {'metadata.fileType': '15AREVAE'},
          // {'metadata.fileType': 'AREVCIL'}, {'metadata.fileType': '15AREVCIL'},

          {'metadata.fileType': 'OBJEINME'}, {'metadata.fileType': '15OBJEINME'},
          {'metadata.fileType': 'OBJEINMERE'}, {'metadata.fileType': '15OBJEINMERE'},
          {'metadata.fileType': 'OBJEINCL'}, {'metadata.fileType': '15OBJEINCL'},
        ],
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
