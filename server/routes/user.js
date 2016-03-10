var express = require('express');
var mongoskin = require('mongoskin');
var config = require('../config');

var id = mongoskin.helper.toObjectID;
var router = express.Router();


/* Get User. */
router.post('/', function(req, res, next) {
  db = mongoskin.db('mongodb://'+config.dbUser+':'+config.dbPass+'@'+config.dbIp+':'+config.dbPort+'/'+config.csAdministratorDatabase+'?authSource=admin', {safe:true});
  db.collection('user').find({username: req.body.username, password: req.body.password},{}).toArray(function(e, results){
        if (e) return next(e);
        db.close();
        res.send(results);
    });
});



module.exports = router;