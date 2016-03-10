var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var bz2 = require('unbzip2-stream');
var config = require('../config');
var MongoClient = mongo.MongoClient;
var GridFSBucket = mongo.GridFSBucket;


/* GET Output file from GridFS. */
router.get('/:distribAlias/outputFs/:filename', function(req, res) {
  
  MongoClient.connect('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'+req.params.distribAlias+'-database?authSource=admin', function(err, db) {
    console.log('Retrieve from OutputFS: ' + config.csOutputFilesRoot + req.params.filename);
    var bucket = new GridFSBucket(db, { bucketName: 'outputFs' });
    var downloadStream = bucket.openDownloadStreamByName(config.csOutputFilesRoot + req.params.filename);
    downloadStream.on('error', function(err) {
      console.log(err);
    });
    res.setHeader('Content-Type', 'application/octet-stream');
    if(hasFileCompression(req.params.filename))
      downloadStream.pipe(bz2()).pipe(res);
    else
      downloadStream.pipe(res);
  });
});


/* GET Input file from GridFS. */
router.get('/:distribAlias/:distribCode/inputFs/:filename', function(req, res) {
  
  var absolutePath = getAbsolutePathInputFs(req.params.distribCode, req.params.filename);
  MongoClient.connect('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'+req.params.distribAlias+'-database?authSource=admin', function(err, db) {
    console.log('Retrieve from InputFS: ' + absolutePath + req.params.filename);
    var bucket = new GridFSBucket(db, { bucketName: 'inputFs' });
    var downloadStream = bucket.openDownloadStreamByName(absolutePath + req.params.filename);
    downloadStream.on('error', function(err) {
      console.log(err);
    });
    res.setHeader('Content-Type', 'application/octet-stream');
    if(hasFileCompression(req.params.filename))
      downloadStream.pipe(bz2()).pipe(res);
    else
      downloadStream.pipe(res);
  });
});





/* ----------------AUXILIAR FUNCTIONS  --------------------------------------------------------------------------------------------------------------*/


function getAbsolutePathInputFs(distribCode, filename){
  var absolutePath = config.csInputFilesRoot;
  
  var fileTokensUnderscore = filename.toLowerCase().split('_');
  var fileTokensDot = filename.toLowerCase().split('.');
  
  if(fileTokensDot[2] === 'bad2') // is a BAD2 file
    absolutePath = absolutePath + 'REE' + config.relativeInputDirectories.bad2;
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