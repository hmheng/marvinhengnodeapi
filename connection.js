var mysql=require('mysql');
var connection= mysql.createPool({	
	host     : '',
	user     : '',
	password : '',
	database : 'testapi'

});
module.exports=connection;