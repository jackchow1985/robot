var express = require('express');
var router = express.Router();
var mongo = require('mongoskin');
var request = require('request');

//var mongodb = mongo.db("mongodb://remote:jack123@192.168.29.252:27017/fdt?auto_reconnect=true");
var mongodb = mongo.db("mongodb://mongodb:7017/fdt?auto_reconnect=true");

// router.get('/getUserFt', function(req,res, next) {
//     var profile = mongodb.collection("user")
//     profile.findOne({"_id" : req.query["userID"]}, function(err,data) {
//     	if(!err)
//         	res.json(data)
//         else 
//         	res.json(err)
//     })
// });

router.get('/getUserFt', function(req,res, next) {
    var url = "http://121.43.73.64:8098/api/user/" + req.query["userID"]
	var opt = {
		headers: {
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36"
		},
		url : url
	}
	console.info(url)
	request(opt,function(error, response, html) {
		console.info(html)
		var jsonObj = JSON.parse(html);
		res.json(jsonObj)	
	})
});

router.get('/getFtList', function(req,res, next) {
    var profile = mongodb.collection("user")
    profile.find({riskArea:{$gt:req.query["area"]}},{_id:1,riskScores:1,riskArea:1}).sort({riskArea:req.query["sort"]}).limit(20).toArray(function(err,data) {
    	if(!err)
        	res.json(data)
        else 
        	res.json(err)
    })
});

router.post('/auth', function(req,res, next) {
    var users = mongodb.collection("users")
    users.findOne({username : req.body.username, password : req.body.password},function(err,data) {
    	console.info(data)
        if(data) {
         	req.session.userInfo  = data;
          	res.redirect("/");
        } else {
          	res.redirect('/login.html');
        }
    })
});





module.exports = router;
