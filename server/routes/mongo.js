var express = require('express');
var mongoskin = require('mongoskin');
var config = require('../config');

var id = mongoskin.helper.toObjectID;
var router = express.Router();


/* GET all collection list. */
router.get('/:distrib/:collection', function(req, res, next) {
  db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'+req.params.distrib+'-database?authSource=admin', {safe:true});
  db.collection(req.params.collection).find({},{}).toArray(function(e, results){
        if (e) return next(e);
        db.close();
        res.send(results);
    });
});


/* GET collection with uploadDate in period. */
router.get('/:distrib/:collection/:period', function(req, res, next) {
  var now = new Date();
  var initRange = new Date();
  switch (req.params.period){
    case 'lastWeek':
      initRange.setDate(initRange.getDate() - 7);
      break;
    case 'lastTwoWeeks':
      initRange.setDate(initRange.getDate() - 15);
      break;
    case 'all':
      initRange.setTime(0);
    default:
      initRange.setTime(initRange.getDate() -1);
  }

  db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'+req.params.distrib+'-database?authSource=admin', {safe:true});
  db.collection(req.params.collection).find({$and:[{'uploadDate':{'$gte':initRange}},
                                            {'uploadDate':{'$lte':now}}]},{}).toArray(function(e, results){
        if (e) return next(e);
        db.close();
        res.send(results); 
    });
});


module.exports = router;