var express = require('express');
var mongoskin = require('mongoskin');
var config = require('../config');

var id = mongoskin.helper.toObjectID;
var router = express.Router();


/* Get User. */
router.post('/', function(req, res, next) {
    try {
        db = mongoskin.db('mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbIp + ':' + config.dbPort + '/'
            + config.csAdministratorDatabase + '?authSource=' + config.csAdministratorDatabase, {safe: true});
        db.collection('user').find({
            username: req.body.username,
            password: req.body.password
        }, {}).toArray(function (e, results) {
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