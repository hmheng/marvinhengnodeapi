var express = require('express');
var router = express.Router();
var db = require('../connection.js')

/* GET users listing. */
router.get('/', function(req, res, next) {
	db.query('SELECT * from users', function (error, results, fields) {
		if (error) throw error;
		res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
	});
});

module.exports = router;
