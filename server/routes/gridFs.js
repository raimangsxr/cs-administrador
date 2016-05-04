var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var bz2 = require('unbzip2-stream');
var config = require('../config');
var MongoClient = mongo.MongoClient;
var GridFSBucket = mongo.GridFSBucket;


router.get('/:distribAlias/:distribCode/:filename', function(req, res) {
  try{
    var absolutePath = getAbsolutePathInputFs(req.params.distribCode, req.params.filename);
    MongoClient.connect('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'
        +req.params.distribAlias+'-database?authSource='+req.params.distribAlias+'-database',
        function(err, db) {
          var bucket = new GridFSBucket(db, { bucketName: 'inputFs' });
          var downloadStream = bucket.openDownloadStreamByName(absolutePath + req.params.filename);
          downloadStream.on('error', function(err) {
            var errorType = err.message.split(':')[0];
            if (!errorType === 'FileNotFound') {
              console.error(err.message);
              res.status(500).send(err.message);
            }
            bucket = new GridFSBucket(db, { bucketName: 'outputFs' });
            downloadStream = bucket.openDownloadStreamByName(config.csOutputFilesRoot + req.params.filename);
            downloadStream.on('error', function(err) {
              console.error(err.message);
              var errorType = err.message.split(':')[0];
              if (errorType === 'FileNotFound')
                res.status(404).send(err.message);
              else
                res.status(500).send(err.message);
            });
            console.log('Retrieve from OutputFS: ' + config.csOutputFilesRoot + req.params.filename);
            res.setHeader('Content-Type', 'application/octet-stream');
            if(hasFileCompression(req.params.filename))
              downloadStream.pipe(bz2()).pipe(res);
            else
              downloadStream.pipe(res);
          });
          console.log('Retrieve from InputFS: ' + absolutePath + req.params.filename);
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



/* ----------------AUXILIAR FUNCTIONS  --------------------------------------------------------------------------------------------------------------*/


function getAbsolutePathInputFs(distribCode, filename){
  var absolutePath = config.csInputFilesRoot;
  
  var fileTokensUnderscore = filename.toLowerCase().split('_');
  var fileTokensDot = filename.toLowerCase().split('.');
  
  if( (config.REEInputFileTypes.indexOf(fileTokensUnderscore[0]) >= 0) // by file type (until first underscore)
      || (config.REEInputFileTypes.indexOf(fileTokensDot[2]) >= 0) ) // by file extension
    absolutePath = absolutePath + config.REEInputDir;
  else // by Type of file
    absolutePath = absolutePath + distribCode + config.relativeInputDirectories[fileTokensUnderscore[0]];
  
  return absolutePath;
};


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