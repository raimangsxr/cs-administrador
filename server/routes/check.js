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


/* GET total of each CUPS T2 sent by the requested period and distrib */
router.get('/cupsmeasures/:distrib/:year/:month', function(req, res, next) {
  try{
    var db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'
      +req.params.distrib+'-database?authSource='+req.params.distrib+'-database', {safe:true});
    var year = parseInt(req.params.year);
    var month = parseInt(req.params.month);
    var objectiveMonth = new Date(year, month - 1);
    var objectiveNextMonth = new Date(year, month);

    db.collection('medidaPeriodoCups').aggregate([
      {
        $match: {
          codTipoPunto: "2",
          origen: 1,
          fechaInicio: {
            $gte: objectiveMonth,
            $lt: objectiveNextMonth
          }
        }
      },
      { $unwind: "$measures" },
      {
        $project: {
          cupsId: 1,
          gridFileId: 1,
          total: "$measures.actEntrante",
          hora: "$measures.anoMesDiaHora"
        }
      },
      {
        $sort: {
          cupsId: 1,
          hora: 1,
          gridFileId: 1
        }
      }
    ], function(e, results){
      if (e) return next(e);
      db.close();

      var distinctCups = new Set();
      results.forEach(function(mpc) {
        distinctCups.add(mpc.cupsId);
      });
      distinctCups = Array.from(distinctCups);

      var mpcByCupsAndPeriod = {};
      results.forEach(function(mpc){
        mpc.date = new Date( parseInt( mpc.gridFileId.substring(0,8), 16 ) * 1000 ).getTime();
        var hora = Number(String(mpc.hora).substring(6));
        if(!mpcByCupsAndPeriod.hasOwnProperty(mpc.cupsId)) {
          mpcByCupsAndPeriod[mpc.cupsId] = [];
        }
        mpcByCupsAndPeriod[mpc.cupsId][hora] = mpc;
      });
      distinctCups.forEach(function(cups){
        mpcByCupsAndPeriod[cups] = mpcByCupsAndPeriod[cups].filter(function(mpc){return mpc !== undefined});
      });
      var result = distinctCups.map(function(cups){
        var out = {};
        out.cups = cups;
        out.date = Math.max(...mpcByCupsAndPeriod[cups].map(function(mpc){return mpc.date}));
        out.total = mpcByCupsAndPeriod[cups].map(function(mpc){return mpc.total}).reduce(function(a,b){return a+b});
        return out;
      });
      res.send(result);
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


/* GET all objes by the requested year, month and distrib */
router.get('/objes/:distrib/:year/:month', function(req, res, next) {
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
        "fechaFinObjecion": {$lte: new Date(end_period)}
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


/* GET consolidated inventary by the requested distrib and CUPS*/
router.get('/inventory/:distrib/:cups', function(req, res, next) {
  try{
    var db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'
      +req.params.distrib+'-database?authSource='+req.params.distrib+'-database', {safe:true});
    db.collection('inventario')
      .find({
        "cupsId": req.params.cups,
        "estadoProcesamiento": "PROCESADO_OK"
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


/* GET cups by the requested distrib and Aggregation and day*/
router.get('/agcl/:distrib/:year/:month/:day/:aggregationId', function(req, res, next) {
  try{
    var db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'
      +req.params.distrib+'-database?authSource='+req.params.distrib+'-database', {safe:true});
    var aggregationId = req.params.aggregationId;
    var year = parseInt(req.params.year);
    var month = parseInt(req.params.month);
    var day = parseInt(req.params.day);
    var referenceDayTime = new Date(year, month-1, day, 0).getTime();
    db.collection('agcl')
      .find({
        "aggregationId": aggregationId,
        "estadoProcesamiento": "PROCESADO_OK"
      })
      .toArray(function(e, results) {
        if (e) return next(e);
        db.close();
        var cups = [];
        if (results.length > 0) {
          var result = results[0];
          sortedCups = result.historicoDeCUPS.sort(function(a, b) {
            var aTime = new Date(a.fechaInclusionRegistroEnAgcl).getTime();
            var bTime = new Date(b.fechaInclusionRegistroEnAgcl).getTime();
            return (aTime<bTime) ? -1 : ((aTime>bTime) ? 1 : 0)
          });
          sortedCups.forEach(function(doc) {
            var docDateTime = new Date(doc.fechaInclusionRegistroEnAgcl).getTime();
            if (docDateTime > referenceDayTime) {
              return;
            }
            if (doc.tipoOperacion === 'E') {
              cups.push([doc.cupsId, doc]);
            } else {
              var cupsCompare = cups.map(function(c) { return c[0]});
              cups.splice(cupsCompare.indexOf(doc.cupsId), 1);
            }
          });
        }

        res.send(cups.map(function(c) {
          var result = {};
          result.cups = c[1].cupsId;
          result.entrada = c[1].fechaInclusionRegistroEnAgcl;
          return result;
        }));
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