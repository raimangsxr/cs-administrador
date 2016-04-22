var express = require('express');
var mongoskin = require('mongoskin');
var config = require('../config');

var id = mongoskin.helper.toObjectID;
var router = express.Router();


/* GET all collection list. */
router.get('/:distrib/:collection', function(req, res, next) {
    try {
        var db = mongoskin.db('mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbIp + ':' + config.dbPort + '/'
            + req.params.distrib + '-database?authSource=' + req.params.distrib + '-database', {safe: true});
        db.collection(req.params.collection).find({}, {}).sort({uploadDate: -1}).toArray(function (e, results) {
            if (e) return next(e);
            db.close();
            res.send(results);
        });
    } catch (error){
        console.error(error);
        res.status(500).send(error);
    }
});


/* GET collection with uploadDate in period. */
router.get('/:distrib/:collection/:period', function(req, res, next) {
    try {
        var now = new Date();
        var initRange = new Date();
        switch (req.params.period) {
            case 'lastWeek':
                initRange.setDate(initRange.getDate() - 7);
                break;
            case 'lastTwoWeeks':
                initRange.setDate(initRange.getDate() - 15);
                break;
            case 'all':
                initRange.setTime(0);
            default:
                initRange.setTime(initRange.getDate() - 1);
        }

        var db = mongoskin.db('mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbIp + ':' + config.dbPort
            + '/' + req.params.distrib + '-database?authSource=' + req.params.distrib + '-database', {safe: true});
        db.collection(req.params.collection).find({
            $and: [{'uploadDate': {'$gte': initRange}},
                {'uploadDate': {'$lte': now}}]
        }, {}).sort({uploadDate: -1}).toArray(function (e, results) {
            if (e) return next(e);
            db.close();
            res.send(results);
        });
    } catch (error){
        console.error(error);
        res.status(500).send(error);
    }
});


module.exports = router;