var express = require('express');
var mongoskin = require('mongoskin');
var config = require('../config');

var id = mongoskin.helper.toObjectID;
var router = express.Router();


/* GET total of each aggregation sent by the requested period and distrib */
router.get('/aggstotals/:distrib/:year/:month', function(req, res, next) {
    try{
        var db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'
          +req.params.distrib+'-database?authSource='+req.params.distrib+'-database', {safe:true});
        var year = parseInt(req.params.year);
        var month = parseInt(req.params.month);
        db.collection('clmag').aggregate([
            { $match: { mesEfectivo: month, anoEfectivo: year} },
            { $unwind: "$gridFileIdList" },
            { $unwind: "$hourlyAggregationList" },
            { $group: { _id: {aggregationId:"$aggregationId", gridFileId:"$gridFileIdList", date:"$fechaCreacion"}, total: { $sum: "$hourlyAggregationList.total"} } },
            { $sort: { "_id.aggregationId":1, "_id.date":1, "_id.gridFileId":1 } }
        ], function(e, results){
            if (e) return next(e);
            db.close();
            results = results.map(function(item) {
                return {
                    "aggregationId": item._id.aggregationId,
                    "date": item._id.date,
                    "total": item.total
                }
            }); // format results
            var aggregations = getLastDistinctAggregations(results);
            res.send(aggregations);
        });
    } catch (error){
        console.error(error);
        res.status(500).send(error);
    }
});


/* GET only active aggregations with total = 0 or without measures sent by the requested period and distrib */
router.get('/aggswomeasures/:distrib/:year/:month', function(req, res, next) {
    try{
        var db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'
          +req.params.distrib+'-database?authSource='+req.params.distrib+'-database', {safe:true});
        var year = parseInt(req.params.year);
        var month = parseInt(req.params.month);
        db.collection('clmag').aggregate([
            { $match: { mesEfectivo: month, anoEfectivo: year} },
            { $unwind: "$gridFileIdList" },
            { $unwind: "$hourlyAggregationList" },
            { $group: { _id: {aggregationId:"$aggregationId", gridFileId:"$gridFileIdList", date:"$fechaCreacion"}, total: { $sum: "$hourlyAggregationList.total"} } },
            { $sort: { "_id.aggregationId":1, "_id.date":1, "_id.gridFileId":1 } }
        ], function (e, results){
            if (e) return next(e);
            results = results.map(function(item) {
                return {
                    "aggregationId": item._id.aggregationId,
                    "date": item._id.date,
                    "total": item.total
                }
            }); // format results
            var sentAggs = getLastDistinctAggregations(results);
            var sentAggsArray = sentAggs.map(function(agg){return agg.aggregationId}).filter(function(v, i, a){ return a.indexOf(v) === i});
            var zeroTotalAggs = sentAggs.filter(function(agg){return agg.total === 0;})
              .map(function(agg){ return agg.aggregationId })
              .filter(function(v, i, a){ return a.indexOf(v) === i});

            var start_period = new Date(year, month-1, 1, 0).toISOString();
            var end_period = new Date(
              (month === 12) ? (year+1) : year,
              (month === 12) ? 0 : month,
              1, 0
            ).toISOString();

            db.collection('agcl')
              .find({ $or: [
                    { "fechaInicioVigencia": {$lt: new Date(end_period)}, "fechaFinVigencia": {$exists: false} },
                    { "fechaFinVigencia": {$lt: new Date(end_period), $gte: new Date(start_period)} },
                    { "fechaInicioVigencia": {$lt: new Date(end_period)}, "fechaFinVigencia": {$gte: new Date(end_period)} },
                ]},
                {fechaInicioVigencia:1, fechaFinVigencia:1, aggregationId:1})
              .sort(
                {aggregationId:1, fechaInicioVigencia:1, fechaFinVigencia:1})
              .toArray(function(e, results) {
                  if (e) return next(e);
                  db.close();
                  var aggsWithoutMeasures = results.filter(function(agg){
                      return sentAggsArray.indexOf(agg.aggregationId) === -1;})
                    .map(function(agg){
                        return agg.aggregationId })
                    .filter(function(v, i, a){ return a.indexOf(v) === i});
                  res.send({
                      zero: zeroTotalAggs,
                      withoutMeasures: aggsWithoutMeasures
                  });
              });
        });
    } catch (error){
        console.error(error);
        res.status(500).send(error);
    }
});



/* GET objes without answer by the requested period and distrib */
router.get('/objeswoanswer/:distrib/:year/:month', function(req, res, next) {
    try{
        var db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'
          +req.params.distrib+'-database?authSource='+req.params.distrib+'-database', {safe:true});
        var year = parseInt(req.params.year);
        var month = parseInt(req.params.month);
        var reference_period = new Date(year, month-1, 1, 0);
        var start_period = reference_period.toISOString();
        reference_period.setMonth(reference_period.getMonth()+1);
        var end_period = reference_period.toISOString();
        db.collection('objecionIntercambioDistribuidor')
          .find({
            "fechaInicioObjecion": {$gte: new Date(start_period)},
            "fechaFinObjecion": {$lte: new Date(end_period)},
            "aceptacion": "",
            $or: [
              {"objectionOmitted": false},
              {"objectionOmitted": {$exists: false}}
            ]
          })
          .toArray(function(e, results) {
              if (e) return next(e);
              db.close();
              res.send(results);
          });
    } catch (error){
        console.error(error);
        res.status(500).send(error);
    }
});

/* POST input file to set to necesitaRevisionManual */
router.post('/objeswoanswer/necesitarevisionmanual/:distrib/:id', function(req, res, next) {
  try {
    var forcedBy = req.body.forcedBy;
    var db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'
      +req.params.distrib+'-database?authSource='+req.params.distrib+'-database', {safe:true});
    db.collection('inputFs.files').update(
      {_id: id(req.params.id)},
      {
        $set: {
          "metadata.necesitaRevisionManual": true,
          "metadata.necesitaRevisionManualForcedBy": forcedBy,
          "metadata.necesitaRevisionManualForcedDate": new Date()
        },
        $unset: {"metadata.details": 1}
      }, function (error) {
      if (error) return next(error);
      db.close();
      res.status(200).json({"result": "ok"});
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

/* POST input file to set to objectionOmitted */
router.post('/objeswoanswer/objectionomitted/:distrib/:id', function(req, res, next) {
  try {
    var forcedBy = req.body.forcedBy;
    var db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'
      +req.params.distrib+'-database?authSource='+req.params.distrib+'-database', {safe:true});
    db.collection('objecionIntercambioDistribuidor').update(
      {_id: id(req.params.id)},
      {
        $set: {
          "objectionOmitted": true,
          "objectionOmittedForcedBy": forcedBy,
          "objectionOmittedForcedDate": new Date()
        }
      }, function (error) {
        if (error) return next(error);
        db.close();
        res.status(200).json({"result": "ok"});
      });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});




// AUX Methods

function getLastDistinctAggregations(aggs){
    var temp_result = {};
    aggs.forEach(function(agg){
        temp_result[agg.aggregationId] = agg;
    });
    var result = [];
    for(var key in temp_result){
        result.push(temp_result[key])
    }
    return result;
}


module.exports = router;