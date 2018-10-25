var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var mongoskin = require('mongoskin');
var bz2 = require('unbzip2-stream');
var config = require('../config');
var MongoClient = mongo.MongoClient;
var GridFSBucket = mongo.GridFSBucket;
var id = mongoskin.helper.toObjectID;

router.get('/:distribAlias/:distribCode/:filename', function(req, res) {
  try{
    MongoClient.connect('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'
      +req.params.distribAlias+'-database?authSource='+req.params.distribAlias+'-database',
      function(err, db) {
        var bucket = new GridFSBucket(db, { bucketName: 'inputFs' });
        var downloadStream = bucket.openDownloadStreamByName(req.params.filename);
        downloadStream.on('error', function(err) {
          var errorType = err.message.split(':')[0];
          if (!errorType === 'FileNotFound') {
            console.error(err.message);
            res.status(500).send(err.message);
          }
          bucket = new GridFSBucket(db, { bucketName: 'outputFs' });
          downloadStream = bucket.openDownloadStreamByName(req.params.filename);
          downloadStream.on('error', function(err) {
            console.error(err.message);
            var errorType = err.message.split(':')[0];
            if (errorType === 'FileNotFound')
              res.status(404).send(err.message);
            else
              res.status(500).send(err.message);
          });
          console.log('Retrieve from OutputFS: ' + req.params.filename);
          res.setHeader('Content-Type', 'application/octet-stream');
          if(hasFileCompression(req.params.filename))
            downloadStream.pipe(bz2()).pipe(res);
          else
            downloadStream.pipe(res);
        });
        console.log('Retrieve from InputFS: ' + req.params.filename);
        res.setHeader('Content-Type', 'application/octet-stream');
        if(hasFileCompression(req.params.filename))
          downloadStream.pipe(bz2()).pipe(res);
        else
          downloadStream.pipe(res);
      });
  } catch (error){
    console.error(error);
    res.status(500).send(error);
  }
});



router.put('/:distrib/:filename', function(req, res, next) {
  try {
    var fileData = req.body;
    var _id = fileData._id;
    delete fileData._id;
    fileData.uploadDate = new Date(fileData.uploadDate);
    var db = mongoskin.db('mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbIp + ':' + config.dbPort + '/'
      + req.params.distrib + '-database?authSource=' + req.params.distrib + '-database', {safe: true});
    db.collection(config.inputFsCollectionName).update({_id: id(_id)}, fileData, function (error) {
      if (error) return next(error);
      db.close();
      res.status(200).json({"result": "ok"});
    });
  } catch (error){
    console.error(error);
    res.status(500).send(error);
  }
});


/* ----------------AUXILIAR FUNCTIONS  --------------------------------------------------------------------------------------------------------------*/

function hasFileCompression(filename){
  var fileTokensUnderscore = filename.toLowerCase().split('_');
  var fileTokensDot = filename.toLowerCase().split('.');
  if ( config.filesWithoutCompression.indexOf(fileTokensUnderscore[0]) >= 0 //by Type of file
    || config.filesWithoutCompression.indexOf(fileTokensDot[2]) >= 0){ //by REE Confirmation

    return false;
  }
  return true;
}


module.exports = router;