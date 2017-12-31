var mysql=require('mysql');
var connection= mysql.createPool({
	host     : 'hmhengwpdb.cuad7lc0sw9c.us-east-1.rds.amazonaws.com',
	user     : 'hmheng_admin',
	password : 'Cubicurve7db',
	database : 'testapi'
});
module.exports=connection;