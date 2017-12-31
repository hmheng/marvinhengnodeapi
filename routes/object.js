var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var db = require('../connection.js');
var fs = require('fs')
  , Log = require('log')
  , log = new Log('debug', fs.createWriteStream('my.log'));


/* GET object listing. */
router.get('/:mykey', function(req, res, next) {
	var sql = "";
	log.debug("Object: " + req.query.timestamp);
	if(typeof req.query.timestamp == 'undefined' || req.query.timestamp == null)
		sql = "SELECT o.key, k.value, k.timestamp from `object` o JOIN `keyvalue` k ON k.objectid = o.id  WHERE o.`key` = '" + req.params.mykey +"' ORDER BY k.timestamp desc limit 1";
	else
		sql ="SELECT o.key, k.value, k.timestamp from `object` o JOIN `keyvalue` k ON k.objectid = o.id WHERE o.`key` = '" + req.params.mykey +"' AND k.`timestamp` <= '" + req.query.timestamp + "' ORDER BY k.timestamp desc limit 1";  
	
	db.query(sql, function (error, results, fields) {
		if (error) throw error;
		res.send(JSON.stringify(results));
	});
});


/* POST Object. */
router.post('/', function(req, res, next) {
	log.debug("Object: " + req.body.key +","+req.body.value + ", " +Date.now());
	var now = Date.now();
	db.query("SELECT id from `object` WHERE `key` = '" +  req.body.key + "' limit 1", function (error, results, fields) {
		if (error) throw error;
		var id;
		if(results.length == 0){
			var newid = uuid.v4(); 
			id = newid.toString();
			log.debug("Object INSERT1 id: " + id);
			db.query("INSERT INTO `object` VALUES ('"+ id + "','" + req.body.key + "','" + now +"')", function (error, results, fields) {
				if (error) throw error;
				log.debug("Object INSERT2 id: " + id);
				
				if(id != 'undefined' && id != null)
				{
					var newid = uuid.v4(); 
					log.debug("Object INSERT KEYVALUE: " + newid +"," + req.body.value + "," + now + "," + id);
					db.query("INSERT INTO `keyvalue`(`id`, `value`, `timestamp`, `objectid`) VALUES ('" + newid + "','" + req.body.value + "','" + now + "'," + "(SELECT id FROM `object` WHERE `key` = '" + req.body.key + "')" + ")", function (error, results, fields) {
						if (error) throw error;
						db.query("SELECT o.key, k.value, k.timestamp from `object` o JOIN `keyvalue` k ON k.objectid = o.id  WHERE o.`id` = '" + id +"' ORDER BY k.timestamp desc limit 1", function (error, results, fields) {
							if (error) throw error;
							log.debug("Object POST: " + id + ","  + results.key);
							res.send(JSON.stringify(results));
						});
					});				
				}else{
					res.send(JSON.stringify(""));
				}
			});
		}
		else {
			log.debug("Object POST: " + results[0].id);
			id = results[0].id;
			if(id != 'undefined' && id != null)
			{
				var newid = uuid.v4(); 
				log.debug("Object INSERT KEYVALUE: " + newid +"," + req.body.value + "," + now + "," + id);
				db.query("INSERT INTO `keyvalue`(`id`, `value`, `timestamp`, `objectid`) VALUES ('" + newid + "','" + req.body.value + "','" + now + "','" + id + "')", function (error, results, fields) {
					if (error) throw error;
					db.query("SELECT o.key, k.value, k.timestamp from `object` o JOIN `keyvalue` k ON k.objectid = o.id  WHERE o.`id` = '" + id +"' ORDER BY k.timestamp desc limit 1", function (error, results, fields) {
						if (error) throw error;
						log.debug("Object POST: " + id + ","  + results.key);
						res.send(JSON.stringify(results));
					});
				});				
			}else{
				res.send(JSON.stringify(""));
			}
		}
		
	});
});

function InsertKeyValue(value, id, now){
	if(id != 'undefined' && id != null)
	{
		var newid = uuid.v4(); 
		log.debug("Object INSERT KEYVALUE: " + newid +"," + req.body.value + "," + now + "," + id);
		db.query("INSERT INTO `keyvalue`(`id`, `value`, `timestamp`, `objectid`) VALUES ('" + newid + "','" + req.body.value + "','" + now + "','" + id + "')", function (error, results, fields) {
			if (error) throw error;
			db.query("SELECT o.key, k.value, k.timestamp from `object` o JOIN `keyvalue` k ON k.objectid = o.id  WHERE o.`id` = '" + id +"' ORDER BY k.timestamp desc limit 1", function (error, results, fields) {
				if (error) throw error;
				log.debug("Object POST: " + id + ","  + results.key);
				return "a";
			});
		});				
	}else{
		return "";
	}
}
module.exports = router;
