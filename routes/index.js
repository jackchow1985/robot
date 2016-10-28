var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var util = require('util');
var csv = require('express-csv');
var request = require('request');
var md5 = require('md5');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var multer  = require('multer');
var uuid = require('node-uuid');
var tushare = require('tushare');
var exec = require('child_process').exec;
var S = require("string")
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'report/')
	},
	filename: function (req, file, cb) {
		filename = Date.now() + parseInt(Math.random()*Math.pow(10, 4)) + '-' + file.originalname
		console.info(req)
		req.uploadFileName = filename	
		cb(null,   filename)
	}
})
var upload = multer({ storage: storage }).single('file')
// var redis = require("redis"),
//     client = redis.createClient({host:"redis-server"});
var mongo = require('mongoskin');

var mongodb = mongo.db("mongodb://mongodb:7017/fdt?auto_reconnect=true");
var awsMongodb = mongo.db("mongodb://aws-mongo:7017/fdt?auto_reconnect=true");
var ftdb = mongo.db("mongodb://mongodb:7017/ft?auto_reconnect=true");
var ftawsdb = mongo.db("mongodb://aws-mongo:7017/ft?auto_reconnect=true");
var poolAWS = mysql.createPool({
  connectionLimit : 10,
  host     : 'fdtsocial.cbv5tsqqcnq4.ap-northeast-1.rds.amazonaws.com',
  user     : 'qiangda',
  password : '123qiangda',
  multipleStatements : true
});

var poolAliyun = mysql.createPool({
  connectionLimit : 10,
  host     : 'rds90m32z34378l0rwa1.mysql.rds.aliyuncs.com',
  user     : 'qifeng',
  password : 'qifeng23456',
  multipleStatements : true
});
var poolIDC = mysql.createPool({
  connectionLimit : 10,
  host     : '202.55.14.140',
  user     : 'qifeng',
  password : 'g634gp64',
  port : 3307,
  multipleStatements : true
});

var poolSeedSC = mysql.createPool({
  connectionLimit : 10,
  host     : '125.227.191.248',
  user     : 'qifeng',
  password : 'g634gp64',
  port : 3306,
  multipleStatements : true
});

function requireLogin(req, res, next) {
	console.info(req.session)
    if(req.route.path == "/login") {
        if(req.session.userInfo) {
            res.redirect("/");
        } else {
            next();
        }
    } else if (req.session.userInfo) {        
         next();
    } else {
        res.redirect("/login.html");
    }

};

router.get('/', requireLogin, function(req, res, next) {
	res.redirect("/dashboard.html");
});

router.get('/getSession', requireLogin, function(req, res, next) {
	res.json(req.session.userInfo);
});

router.get('/logout', requireLogin, function(req, res, next) {
	req.session.userInfo = null;
	res.redirect("/login.html");
});

router.get('/getSession', requireLogin, function(req, res, next) {
	res.json(req.session.userInfo);
});

// client.get("cached", function(err, cache) {
// 	if(cache)
// 		cacheQuery = JSON.parse(cache); // resume cache from redis
// })

var robotMongodb = mongo.db("mongodb://aws-mongo:7017/ra?auto_reconnect=true");

function _returnMessage(err, result) { 
	var retObj = {}
	if(err) {
		retObj.code = 500
		retObj.msg = err
		return retObj
	} else {
		retObj.code = 200
		retObj.msg = result
		return retObj
	}
}
router.post('/registerUser', function(req, res, next) {
	var userinfo = robotMongodb.collection("userinfo")
	var userSave = {
		region : req.body.region,
		mobile : req.body.regMobile,
		token : uuid.v4(),
		password : req.body.regPassword,
		nick: req.body.regNick,
		cTime : new Date(),
		ccy : "USD"
	}
	userinfo.findOne({mobile : userSave.mobile}, function(err, hasUser) {
		if(hasUser) {
			res.json(_returnMessage("電話號碼已存在"))
		} else {
			userinfo.save(userSave, function(err, userSaved) {
				if(userSaved)
					userSaved.password = undefined
				res.json(_returnMessage(err, userSave))
				
			});
		}
	})
	
})

router.post('/updateRiskLevel', function(req, res, next) {
	var userinfo = robotMongodb.collection("userinfo")
	userinfo.update({token : req.body["token"]}, {"$set" : {risklevel : req.body["risk"]}}, function(err, hasUser) {		
		res.json(_returnMessage(err, hasUser))									
	})	
})

router.post('/loginRAUser', function(req, res, next) {
	var userinfo = robotMongodb.collection("userinfo")
	userinfo.findOne({mobile : req.body["mobile"], password : req.body["password"]}, function(err, hasUser) {		
		res.json(_returnMessage(err, hasUser))									
	})	
})

router.get('/getRAUser', function(req, res, next) {
	var userinfo = robotMongodb.collection("userinfo")
	userinfo.findOne({token : req.query["token"]}, function(err, hasUser) {		
		res.json(_returnMessage(err, hasUser))									
	})	
})


router.get('/queryVol', function(req, res, next) {	
	var readline = require('readline');
	var dataArr = []
	var rd = readline.createInterface({
	    input: fs.createReadStream('R/display.csv'),
	    output: process.stdout,
	    terminal: false
	});

	rd.on('line', function(line) {
	    dataArr.push(line.split(",")[1])	    
	});

	rd.on('close', function() {
		res.json(dataArr)
	})
	// res.json({
	// 	total : 11591082,
	// 	china_fx : 7831028542244,
	// 	global_fx : 3258657430477,
	// 	china_sc : 54329196476,
	// 	china_fc : 7996357974705
	// })
});


var contractMutilper = {"A":10,"B":10,"BB":500,"C":10,"CS":10,"FB":500,"I":100,"J":100,"JD":10,"JM":60,"L":5,"M":10,"P":10,"PP":5,"V":5,"Y":10,"AG":15,"AL":5,"AU":1000,"BU":10,"CU":5,"FU":50,"HC":10,"NI":1,"PB":5,"RB":10,"RU":10,"SN":1,"WR":10,"ZN":5,"CF":5,"FG":20,"JR":20,"LR":20,"MA":10,"OI":10,"PM":50,"RI":20,"RM":10,"RS":10,"SF":5,"SM":5,"SR":10,"TA":5,"WH":20,"ZC":100,"IC":200,"IF":300,"IH":300,"TF":10000,"T":10000}
function _erxtracInstrument(instrumentID) {

	return instrumentID.replace(/[0-9]/g, '').toUpperCase();
}


function getCTPAccountsDaily(cb) {
	var sql = 'select * from LTS_China.ctp_user_behavior where behavior="OnRspQryTradingAccountForMy" and brokerid ="7090"'
	_queryCTP(sql, function(err, result) {
		var totalCommision = 0, accountMap = {}, tradeDates = {}
		console.info("accounts length " + result.length)
		for(var i in result) { // filter the accounts settlment 
			if(result[i].args) {
				var ctpObj = JSON.parse(result[i].args)
				if( !accountMap[ctpObj.AccountID + ctpObj.TradingDay]
					|| (accountMap[ctpObj.AccountID + ctpObj.TradingDay] 
						&& accountMap[ctpObj.AccountID + ctpObj.TradingDay].ts <= result[i].createTime)) {
					accountMap[ctpObj.AccountID + ctpObj.TradingDay] = ctpObj
					accountMap[ctpObj.AccountID + ctpObj.TradingDay]["ts"] = result[i].createTime 
						
				} else {
					console.info("Dedup account " + result[i].account + " - " + result[i].createTime)
				}
			}
		}
		console.info("Dedup account length: " + Object.keys(accountMap).length)
		for(var i in accountMap) {
			if(accountMap[i]) {
				var ctpObj = accountMap[i]
				if(ctpObj.hasOwnProperty("Commission")) {	
					 	
					if(tradeDates[ctpObj.TradingDay]) {
						tradeDates[ctpObj.TradingDay].Commission += ctpObj.Commission
						tradeDates[ctpObj.TradingDay].Balance += ctpObj.Balance
						tradeDates[ctpObj.TradingDay].Withdraw += ctpObj.Withdraw
						tradeDates[ctpObj.TradingDay].Available += ctpObj.Available
						tradeDates[ctpObj.TradingDay].CashIn += ctpObj.CashIn
						
					} else {
						tradeDates[ctpObj.TradingDay] ={
							Commission : 0,
							Balance : 0,
							Withdraw : 0,
							Available :0,
							CashIn: 0
						}

					}		

					//console.info(ctpObj.AccountID + " : "+ ctpObj.Commission)
					totalCommision +=  ctpObj.Commission
					
				} else {
					console.info("Incomplete daily settlement: " + JSON.stringify(ctpObj))
				}
				
			} else {
				console.info("No args " + accountMap[i])
			}
			
		}
		//console.info("###### Total Commission: " + totalCommision)
		//console.info("###### Accounts: " + JSON.stringify(tradeDates))
		cb({
			totalCommision : totalCommision,
			tradeDates : tradeDates
		})
	})
}

function getCTPDailyLogin(cb) {
	var sql = 'select count(distinct account) as count , date(FROM_UNIXTIME(createTime/1000)) as date  from LTS_China.ctp_user_behavior where behavior="doLogin" and brokerid ="7090" group by date(FROM_UNIXTIME(createTime/1000))'
	_queryCTP(sql, function(err, result) {
		cb(result)
	})
}

function getCTPTotalTradeRecord(cb) {
	var sql = 'select * from LTS_China.ctp_user_behavior where behavior="OnRtnTrade" and brokerid ="7090"'
	_queryCTP(sql, function(err, result) {
		var totalAmount = 0, totalVol = 0;
		var dateTrades = {}
		for(var i in result) {
			if(result[i].args) {
				var ctpObj = JSON.parse(result[i].args)
				//console.info(ctpObj)
				if(ctpObj.Price && ctpObj.Volume && ctpObj.InstrumentID) {

					var mutiper = contractMutilper[_erxtracInstrument(ctpObj.InstrumentID)]
					if(mutiper) {

						var amount = parseFloat(ctpObj.Price * mutiper * ctpObj.Volume)
						totalAmount += amount;
						totalVol += ctpObj.Volume
						if(dateTrades[ctpObj.TradeDate]) {
							dateTrades[ctpObj.TradeDate]["tAmount"] = dateTrades[ctpObj.TradeDate]["tAmount"] + amount
							dateTrades[ctpObj.TradeDate]["tVol"] = dateTrades[ctpObj.TradeDate]["tVol"] + ctpObj.Volume
						} else {
							dateTrades[ctpObj.TradeDate] = {
								tAmount : amount,
								tVol : ctpObj.Volume
							}
						}
						// console.info("InstrumentID : " + ctpObj.InstrumentID + "|" + ctpObj.Price + "|" + ctpObj.Volume +  ", amount : " + amount )
					} else {
						console.info("can not find mutiper: " + ctpObj.InstrumentID)
					}

				} else {
					console.info("Incomplete txn: " + ctpObj)
				}
				
			} else {
				console.info("No args " + result[i])
			}
			
		}
		for(var i in dateTrades) {
			console.info(i + "	" + dateTrades[i].tAmount)
		}
		cb({
			totalAmount : totalAmount,
			totalVol: totalVol,
			dateTrades : dateTrades
		})
		//console.info("###### Total amount: " + totalAmount)
		//console.info("###### Total Volume: " + totalVol)
	})
}

// var poolSHQA = mysql.createPool({
//   connectionLimit : 10,
//   host     : '192.168.4.71',
//   user     : 'tqt001',
//   password : 'tqt002',
//   multipleStatements : true
// });

function _queryCTP(query, cb) {
	poolAliyun.getConnection(function(err, connection) {
		//console.info(query)
		if(connection) {
			connection.query(query, function(err, rows, fields) {
			  if (err) cb(null);
			  	else { 
				  	cb(null, rows)
				}
			  connection.release();
			});
		} else {
			cb("no connection")
		}
	});
}

router.get('/getCTPInfo', function(req, res, next) {
	if(req.query["action"] == "sum") {
		getCTPTotalTradeRecord(function (result) {
			res.json(result)
		})
	} else if(req.query["action"] == "login") {
		getCTPDailyLogin(function (result) {
			res.json(result)
		})
	} else {
		getCTPAccountsDaily(function (result) {
			res.json(result)
		})
		
	}
})



router.get('/getRiskFeaturesImage', function(req, res, next) {
	res.sendFile(path.resolve() + "/axes/" + req.query["userId"] + "/" + req.query["file"])
})

router.get('/getRiskFeatures', function(req, res, next) {
	client.get("risk-feature-" + req.query["userId"], function(err, cache) {
	//res.json(JSON.parse('{"annual_return":-0.46,"annual_volatility":0.2,"sharpe_ratio":-3.01,"calmar_ratio":-1.8,"stability_of_timeseries":-0.67,"max_drawdown":-0.26,"omega_ratio":0.52,"sortino_ratio":-3.47,"skew":-0.78,"kurtosis":2.98,"tail_ratio":0.57,"common_sense_ratio":0.31,"information_ratio":10.58,"alpha":1.15,"beta":1}'))
		if(cache) {
			res.json(JSON.parse(cache))
		} else {
			var cmd = '/home/caochen/anaconda2/bin/python /home/caochen/test/pyfolio_ft.py ' + req.query["userId"];

		    exec(cmd, function(error, stdout, stderr) {
		    	var tableStr = S(stdout).between("Performance statistics   Backtest","Worst Drawdown Periods").s;
		    	var out = "", isnewline = true;
		    	for(var i in tableStr) {
		    		var tmpStr =  tableStr[i]
		    		if( tmpStr == " " && isnewline) {
		    			tmpStr = "\":";
		    			isnewline = false;
		    		}
		    		if( tmpStr == '\n') {
		    			tmpStr = ",\""
		    			isnewline = true
		    		}
		    		out = out + tmpStr
		    	}
		    	//var out = S(tableStr).replaceAll(" ", ":").replaceAll("\n", ",").s
		    	var json  = "{" + out.slice(1,out.length-2) + "}";
		    	client.set("risk-feature-" + req.query["userId"], json); 
		    	res.json(JSON.parse(json))
		    });
		}
	})
})



router.get('/getPredictFromMongo', function(req, res, next) {
	// if(req.session.userInfo.username == 'sam' ||req.session.userInfo.username== 'bill' || req.session.userInfo.username== 'dap' || req.session.userInfo.username== 'jack') {			
		predicts = ftawsdb.collection("allsc")
		var limit = parseInt(req.query["limit"]) || 50
		predicts.find({},{"DATA_date" :1}).sort({"DATA_date" : -1}).limit(1).toArray(function(err, maxItem) {
			if(maxItem && maxItem.length > 0 && maxItem[0]) {
				var date = req.query["date"] || maxItem[0]["DATA_date"]
				predicts.find({"DATA_date" : date},{"_id" : 0 }).sort({"testPred" : -1}).limit(limit).toArray(function(err, stocks) {		
					// _getRealTimeQuote(function(data) {
					// 	var stockMap = {}
					// 	for(var i in data) {
					// 		stockMap[data[i].code] = data[i]
					// 	}
					// 	for(var k in stocks) {
					// 		stocks[k]["realtimeInfo"] = stockMap[stocks[k].stock_id]
					// 	}
						res.json(stocks)
					//})
				
				})
			} else {
				res.json([])
			}
		})
	// } else {
	// 	res.json([])
	// }

});

router.get('/getPredictionHistoryTop', function(req, res, next) {	

	client.keys("predict_*", function(err, datas) {		
		res.json(datas)
	})
})

router.get('/getPredictionHistoryTopByDate', function(req, res, next) {	

	client.get(req.query["date"], function(err, datas) {		
		res.json(JSON.parse(datas))
	})
})


router.get('/getPredict', function(req, res, next) {	
	var readline = require('readline');
	var dataArr = []
	var rd = readline.createInterface({
	    input: fs.createReadStream(req.query["bottom"] ?'R/bottom.csv' : 'R/top50.csv'),
	    output: process.stdout,
	    terminal: false
	});

	rd.on('line', function(line) {
		var obj =  {
			symbol : line.split(",")[3].replace(/\"/g ,""),
			predictVolo : line.split(",")[4]
		}
	    dataArr.push(obj)	    
	});

	rd.on('close', function() {
		if(new Date().getHours() < 15) {
			client.get("quote", function(err, cache) {
				res.json(JSON.parse(cache))
			})
		} else {
			_getRealTimeQuote(function(data) {
				var stockMap = {}
				for(var i in data) {
					stockMap[data[i].code] = data[i]
				}
				for(var k in dataArr) {
					dataArr[k]["realtimeInfo"] = stockMap[dataArr[k].symbol]
				}
				client.set("quote", JSON.stringify(dataArr))
				res.json(dataArr)
			})
		}
		
	})

});




router.get('/getAllContestByApp', function(req, res, next) {
	var db = "";
	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	var sqlString = "select c.contest_id, n.name, c.apply_user_total, n.icon_image from %s_%s.contest_social_center as c, %s_%s.contest_social_notice as n where convert(n.contest_id using utf8) = convert(c.contest_id using utf8) order by c.apply_user_total desc"
	sqlString = util.format(sqlString, db, req.query["app"], db, req.query["app"])
	_query(req.query["db"], sqlString, function(err, result) {
		
		res.send(result);
				
			
	}, true)
});

function _getMaxMinFromMongo(features, query, ft,  cb) {
	var sortMax = {}, sortMin = {}
	sortMax[ft + ".raw"] = -1
	sortMin[ft + ".raw"] = 1
	var fields = {}
	fields[ft] = 1
	query["ft_tdd.raw"] = {$ne: 0}
	features.find(query,fields).sort(sortMax).limit(1).toArray(function(err, maxItem) {
		features.find(query,fields).sort(sortMin).limit(1).toArray(function(err, minItem) {
			console.info(maxItem)
			console.info(minItem)
			try {
				cb(err, {max: maxItem[0][ft].raw, min : minItem[0][ft].raw})
			} catch(e) { // error default to 1
				cb(err, {max: 1, min :0})
			}
		})
	})
}
var util = require('util');
router.get('/getFDTScoreList', function(req,res, next) {

	var features = ftdb.collection(req.query["col"])
	if(req.query["region"] == "Global" || req.query["region"] == "SEEDFT" || req.query["region"] == "GlobalINC") {
		features = ftawsdb.collection(req.query["col"])
	}
	var query = {}

	query["ap_tg"] = req.query["ap_tag"]
	if(req.query["arena"])
		query["arena_tg"] = req.query["arena"]
	query["wt_tg"] = req.query["wt_tg"] || (req.query["ap_tag"].indexOf("simc") >=0 ? "fsw_simc_1" : "fsw_sim_default")
	    	    
	    
	 _getScoreLastTradeDate(req.query["col"], {ap_tg : req.query["ap_tag"]}, function(tradeDate) {
    	console.info(tradeDate)
    	if(tradeDate) {
    		query["last_trade_date"] =  req.query["trade_date"] || tradeDate   
			
			var sortOpt ={}
			if(req.query["desc"] != "Random")
				sortOpt[req.query["sort"]] = (req.query["desc"] == "Top" ? -1 :1)
			if(req.query["dist"] || req.query["ft"]) {
				if(req.query["ft"]) {
					_getMaxMinFromMongo(features, query, req.query["ft"], function(err, item) {
						console.info(item)
						var binSize = Math.abs((item.max - item.min)/1000);
						console.info("binSize :" + binSize)
						var binUnit = "$" + req.query["ft"] + ".raw"
						var project = {$project: {
							scoreLowerBound: {
								$subtract:[binUnit, {"$mod":[binUnit,binSize]}
								]}
							}
						}
						console.info(project)
						var aggOpt = [ { "$match": query}, project ,{$group: {_id:"$scoreLowerBound", count:{$sum:1}}} ] 
						console.info(util.inspect(aggOpt, {showHidden: false, depth: null}))
						features.aggregate(aggOpt, function(err, items) {
							if(err) 
								res.json(err);
							else
				        		res.json(items)
						});

					})
				} else {
					var aggOpt = [ { "$match": query}, {$project: {scoreLowerBound: {$subtract:["$" + req.query["dist"] + ".score", {$mod:["$" + req.query["dist"] + ".score",1]}]}}},{$group: {_id:"$scoreLowerBound", count:{$sum:1}}} ] 
					console.info(aggOpt)
					features.aggregate(aggOpt, function(err, items) {
						if(err) 
							res.json(err);
						else
			        		res.json(items)
					});
				}

			} else {
				console.info(query)
				if(req.query["format"] == "csv") {
					features.find(query, {_id:0, user_id:1, fdt:1,  ft_up:1, }).sort(sortOpt).toArray(function(err, data) {
				    	var headers = {
				    		
				    		fdt_score : "fdt_score",
				    		roi : "roi",
				    		user_id : "user_id"

				    	};
		                
		                for(var i in data) {
		                	data[i].fdt = data[i].fdt["score"];
		                	data[i].ft_up = (data[i].ft_up["raw"] - 1)*100;
		                }
		                var csvData = data;
		                csvData.unshift(headers);
		                //console.info(csvData)
						res.csv(csvData);
				    })
					
				} else {
				    features.find(query, {user_id:1, fdt:1, ts:1, prod:1,ft_up:1, ft_mdd:1, ft_shp_rt:1, ft_tdd:1}).limit(parseInt(req.query["limit"])).sort(sortOpt).toArray(function(err, data) {
				    	res.json(data)
				    })
				}
			}
		}
	}, req.query["region"])
			
});


router.get('/getWeightFileByCol', function(req, res, next) {
var mongoEP = ftdb
	if(req.query["region"] == "Global")
		mongoEP = ftawsdb	
	_getScoreLastTradeDate(req.query["col"], {ap_tg : req.query["ap_tag"]}, function(tradeDate) {
		mongoEP.open(function(err,resp) {
			resp.collection(req.query["col"], {strict: true}, function(err, myCollection) {
				if(myCollection) {
			    	myCollection.distinct('wt_tg', {ap_tg : req.query["ap_tag"], last_trade_date:tradeDate}, function(err,result) {		        
				       	res.json(result)				     				        
			    	})
			    } else {
			    	res.json([])
			    }
			});
		})
	}, req.query["region"])
	
})

function _getApTagFromCol(colList, index, aplist, cb, region) {
	var mongoEP = ftdb
	console.info(colList)
	if(region && region == "Global")
		mongoEP = ftawsdb
	if(index < colList.length) {
		mongoEP.open(function(err,resp) {
			resp.collection(colList[index].source, {strict: true}, function(err, myCollection) {
				if(myCollection) {
			    	myCollection.distinct('ap_tg', {}, function(err,result) {		        
				        for(var i in result) {
				        	aplist.push({ source : result[i], col : colList[index].source, weights : colList[index].wt_tg_ls })	
				        }					     
				        index ++;      
				        _getApTagFromCol(colList, index, aplist, cb, region)
			    	})
			    } else {
			    	index ++;      
				    _getApTagFromCol(colList, index, aplist, cb, region)
			    }
			});
		})
	} else {
		cb(aplist)
	}
}

router.get('/queryContestByApp', function(req, res, next) {	

	var metaCol = ftdb.collection("meta")
	if(req.query["region"] == "Global")
		 metaCol = ftawsdb.collection("meta")
	metaCol.find({}).sort({source:1}).toArray(function(err, cols) {    	    
		_getApTagFromCol(cols, 0, [], function(data) {
			res.json(data)
		}, req.query["region"])
	})
})

router.post('/arenaAuth', function(req, res, next) {	
	console.info(req.body)
	if(req.body && req.body.email) {
		var username = req.body.email.split("@")[0]
		var userSave = {
			email : req.body.email,
			username : username,
			token : uuid.v4(),
			type : "guest",
			arenaRole: "trader"
		}
		var users = mongodb.collection("users")
		users.findOne({email : req.body.email}, function(err, hasUser) {

			if(hasUser) { //email exsis
				res.redirect("http://dashboard.hkfdt.cn:8098/?token=" + hasUser.token)
			} else {
				users.save(userSave, function(err, userSaved) {
					if(err) {
						console.info(err)
						res.redirect("kline.html#/fail")
					} else { // successfully create account
						res.redirect("http://dashboard.hkfdt.cn:8098/?token=" + userSave.token)
					}
					
				})
			}
		})
	} else {
		res.redirect("kline.html#/fail")
	}
})

var coreUserList = ["jackchow1985", "mb000009463", "tusshar", "aa10011120","abhi12345","abhijeettulaskar","abhishek04","adamyu22","adi","aditya84101","adityam20","ady1830","akashbegins","akashincometrade","akashkhurana","akauffman","akhils","akshayparate","akshays","akshit13","algorial","allanbabu","amanjotsingh15","amankapoor","amasterfx","amitmalik","andreverde","andy449liang","aneesh12","aniruddhayadav47","ankitdxt","ankurg","anky1","annie42381","anselmtheking","anson93827","anujrana15","ap6994","artyff","arvindsuresh","ashabhati","ashish9292","ashu2","ashu6","assassin21","asunil1991","at1996","atul92","av9110","ayukumar","ayushbhoyar","azaziel","azz","b3001047","b561","babalu","baces","bahadure","bali0bali","basim","ben101993","bittu005","bkothari","blacksheep23","blyhte","bowmanatt23","boyuan xu","brainnnn","bs2161","chandan","chanpreet123","charon","chas94","chetankumawat","cheung1111","chienleelim","chiling","chiru611","chrisckwong821","chunho","chunholch","clayreynolds","colin2","colin3","colinone","coolviraj","crosscascader","cymos","daemon13","daniel","daniel2002618","darkmatter","darshand","dattapatil33com","dattathreya","davidzsy20","deepak6797","deepankart","derek","devangcooldude","devanjan","dhairyabhati","dheeraj","dheins80","dhirendra","dk2114","dondom10","donny541095954","dq24","dustinart","eddiehtc","edsa7539510","eepster52","elthon","eltond","enterfinance","erichungtwtw","erudite","eugenechen","extremegzone","fahads143","fatalerror","fb-10153152076271131","fb-10205019364576427","fb-10206273359050046","fb-10206705414020787","fb-371200423091066","fb-674600036002137","fb-683969458416546","fb-684025591702095","fb-807167022702877","fb-957882250899059","fb-978464468831029","fjazon","forexking69","freexdstep","gaurav111","gaurav868","gauravkalotra","gobindanayak406","green229","greyovo","guoxian","gursimransingh","gustavoca9090","hailcaesar","hamza","handsomeishu","hardik1995","hardikjain","hardikjain1","hcmhenry","hgrg56","hirendra94","hiteshsuthar","honshan","hsyang","huyue","ict","ikrar232","imrs","indronik","investfrommind","investment","irmiya009","ivehw140011744","jackyj","jackyww","jaepal93","jaichouhan","jamesbhardwaj","janesh","janesh366","jaredarat","jassi7","jayeshu1007","jayk79","jeppo","jerrythy338","jessiuat","jieyuwang","jimmychu","jimmylammai","jimmysgod0223","jinitjain26","jitin","jitinbahri","jits100","jocjocpcl","joefung03","joeprod","jponly","jsthl","jtamarin","jtrinh","ju88157","junaidp393","k4r4t4s","kailash","kalpesh","kam9","kanav123","kapish98","kapoorstockports","karpenet","kean","keigo","kelvinkoopa","kespur07","ketan232","khho_lo","kinglyte","kiran11","kirtesh08","kjasdeep","kjjohn95","km5zvy","kmworld007","kohlor","kpcool95","krishna1791","krunal83","ksuen9506","kumarsushant","kunal3195","kushagarwal","kwlee","l123730387","lakshay007","lakshay786","lelouchakira","lemoned","liper66","livingstone","lizaleung","lkl6056","loch","logantheman","lorettachow96","loving143","lpz952035","lsestudentpm","luojieshun","lwp2015327","maamunrezaa","maarkandeya","mahboobreza","maheshsingh","mahull122","mahull123","mahull126","mahull127","mahull128","mahull130","manasrishav","mangesh5926","marcusslee95","marcusyu","marumori","mattlee117","maxhui","maxisor3","maxwongyk","mayank57","mayankgoel23","mayankgoel24","mayurrko","mayurrko1","mayurumdekar","mb000000227","mb000000655","mbeer","mchen","me123","me4","mearpit","meet2522","mgmalden","michaelc12","michwong","minttints","mishank","mistrymah","mkyamaguchi","mohdadan","mohdarafat","moneygang22","mpenagos7","mrtgm","msky82","muditgarg","mukesh22","mukeshmali16","nachi123","naved90","neel05","nihao0630","nik0001","nikhilardent","nikmax","niksss","nimkouse","nishant7648","oaisgood","oceanwong","ocfutuer","odevina","om1234","onthegrind21","op2462003","p8800","panpre","pavmanu","pawan84","pearlwee","philaychia","poker1","poker2","poker3","poker5","prafukor","pragod5595","prakashkaneria","prakhar967","prasad2122th","prashantmishra","prateek121","priyankajain","ptkhai94","pulkitgarg","puneet1977","puneetsaxena","puremager","qwagh","qymi89064","rajeshyolo","rajsinghaditya","raju1","ranasingh","ratikmahajan","ravi007","rayleung920303","redmond1500","revanth","rheegr","richboy334","richi1abc","rickykaus","riegood","rish25","rishab13","ritikac","rjrajeev","ro66i","rohangarg","ronakp77","ronith","rozykhan","rstag8","russian","ryanau","sagatbhasin10","saif","sandeepbabu","sanil111","sanjaykumar","sanjaysinghkhang","sarahsiny","sarthakarora","satyajitg","satyam","saubanahmad","savita","savshit","sbansal","sctse","sgian","sgoenka4777","shabista","shagy5151","shailesh13","shakyavishal4246","shane1010","sharond","shashank1202","shashvat2912","sheetij","shih0119","shikhar","shilpaparihar","shiv25","shivamdaga","shivamkhandelwal","shivanituli08","shivbhatter","shravii","shreyansb12","shubham51","shubhamsonthalia","shubhamvarma","siddhantk267","siddharthmittal","sidhantarora","simransingh13","singh888","siraj","sircharlemagne","skyandsea","skypig","snowypeng","sohail3776","sonam","sonia","sony080","spartansshadow","sravanth1000","sreejesh","srikanth767","srjdhk","ssid005","stevencherv","strike3yearout","subowxd","sunny001","sunnyv","superbsachin98","swapmanutd","swayam72","swrangt","talib44","tan74may","taranga","tarmini112","tarun3510","tech","tejas1","theceo1","tommycwh","tomyum05","tony960104","transect","troyc","udayakumar","ujjwalunlimited","umeshbhati","unnitkothari","v1439","v664","vamhatre","vandal1233","varshneyank56","varun","vermroha2","vickytoni","viera27","vinam7395","vincent992","vips","vipull","vishal7591","vishalkabra","vishalkmr","vishalkmr9993","vishalshakya","vishykmr","vivekyadav","vonneumann","vrv","waiianian","walin","wallstreetguy","wban112","weezxc","wind910","winnerchung","wusiuoi","wylau21","xiao296446741","xp95953005","yash120","yashah13","yashkgp","yashm","ykler","yudelin","yuveshen","yuyachih0211","zchen","zhudaddy","zhutianqi","zhuxu0903","ziyichen"]
router.post('/auth', function(req, res, next) {	
	if(req.body.appId != "admin") {
		if(coreUserList.indexOf(req.body.username) < 0) {
			res.redirect('/login.html#/fail');
		} else {
			console.info(req.body.appId)
			var appId = req.body.appId.split("_")[0];
			var region = req.body.appId.split("_")[1]
			var db = "";
			if(region == "CN") {
				db = "lts_china"
			} else {
				db = "LTS_Global"
			}
			var sql = "select * from " + db + ".AUTH where USERID='" + req.body.username + "'"
			console.info(sql)
		 	_query(req.query["db"], sql, function(err, data) {
				if(data && data.length > 0) {
					var userAuth = data[0]
					if(md5(req.body.password + userAuth.SALT) == userAuth.PASSWORD) {
			          	req.session.userInfo  = {
			          		username: userAuth.USERID,
						    nick: userAuth.USERNAME,
						    role: '000010',
						    region: region,
						    school: 'All',
						    core: true,
						    app : appId
						};
			           	res.redirect("/dashboard.html#/index/profile/" +  req.body.username + "/" + region + "/" + appId);
			         } else {
			           	res.redirect('/login.html#/fail');
			        //res.json(md5(req.query["password"] + userAuth.SALT))
			         }
			    } else {
		           	res.redirect('/login.html#/fail');
		       
		        }
		    }, true)
		}
	 } else {
	 	console.info("admin login")
	    var users = mongodb.collection("users")
	    users.findOne({username : req.body.username, password : req.body.password},function(err,data) {
	    	//console.info(data)
	        if(data) {
	         	req.session.userInfo  = data;
	          	res.redirect("/");
	        } else {
	          	res.redirect('/login.html');
	        }
	    })
	}
});

router.get('/getContestScore', function(req,res, next) {
	
	var contestId = req.query["contest_id"]
	var appId = req.query["app_id"];
	var mongoEndpoint = ftdb
	var col = appId + "_china_prod"
	if(req.query["test"]) //add test evn support
		col = appId + "_china_test"
	if(req.query["region"] == "Global") {
		col = appId + "_global_prod";
		mongoEndpoint = ftawsdb
	}
	var features = mongoEndpoint.collection(col)
	var query = {}
    if(!contestId || !appId) {
    	res.json({msg: "No parameter"})
    } else {
		query["ap_tg"] = appId + "_simc_" + contestId;
		query["wt_tg"] = "fsw_simc_1"
	    	    
	    console.info(col)
	    _getScoreLastTradeDate(col, query, function(tradeDate) {
	    	console.info(tradeDate)
	    	if(tradeDate) {
	    		query["last_trade_date"] =  req.query["trade_date"] || tradeDate
	    		console.info(query)
	    		
			    features.find(query).sort({"fdt.score" : -1}).toArray(function(err, data) {
			    	if(!err && data && data.length >0 ) {	
			    		var results = [];		    		
			    		for(var k in data) {			    			
			    			var lastRank = mongoResult(data[k])			    			
							results.push(lastRank)
			    		}
			    		res.json(results)
			        } else {
			        	res.json([])
			        }
			    })
			} else {
				res.json([])
			}
	    }, req.query["region"])
	}
});

function _compareRank (a, b) {
	if(a > b)
		return "down"
	else if( a == b) 
		return "same"
	else 
		return "up"
}

function _getScoreLastTradeDate(col, appQuery, cb, region) {
	var mongoEndpoint = ftdb
	if(region && (region == "Global" || region == "TW" || region == "SEEDFT" || region == "GlobalINC"))
		mongoEndpoint = ftawsdb
	var coll = mongoEndpoint.collection(col)
	
    coll.find(appQuery,{last_trade_date:1, _id:0}).sort({"last_trade_date": -1}).limit(1).toArray(function(err,res) {
        if(res && res.length > 0) {
        	cb(res[0].last_trade_date)
        }  else {
        	cb([])
        }
        
    })
	
}

router.get('/getUserFeatures', function(req,res, next) {
	var region = req.query["region"];
	var appId = req.query["app_id"];
	var col = appId + "_china_prod"
	var features = ftdb.collection(col)
	if(region == "Global" || region == "TW" ) {
		col = appId + "_global_prod"
		features = ftawsdb.collection(col)

	} else if(region == "INC") {
		col = appId + "_china_inc"
		features = ftdb.collection(col)
	} else if(region == "SEED" || region == "SEEDSC") {
		col = appId + "_china_seed"
		features = ftdb.collection(col)
	} else if(region == "SEEDFT" ) {
		col = appId + "_global_seed"
		features = ftawsdb.collection(col)
	} else if(region == "GlobalINC" ) {
		col = appId + "_global_inc"
		features = ftawsdb.collection(col)
	} 
	var contestId = (req.query["contest_id"] == "undefined" ? "" : req.query["contest_id"])
	var query = {}
	query = {
    	//ap_tg :  req.query["ap_tg"] ||  appId + "_simc_" + contestId, 
    	//wt_tg :  req.query["wt_tg"] || "fsw_simc_1" 
    }
    if(req.query["app_id"] && !req.query["ap_tg"]) { //no ap tag
    	if(contestId) { //with contest id
    		query["ap_tg"] = appId + "_simc_" + contestId;
    		query["wt_tg"] = "fsw_simc_1"
    	} else { // no contest, all user
    		query["ap_tg"] = appId + "_sim_all"     	
    		query["wt_tg"] = "fsw_sim_default"
    	}
    } else if(req.query["ap_tg"]) {
    	query["ap_tg"] = req.query["ap_tg"]
    } 
    if(req.query["wt_tg"]) {
    	query["wt_tg"] = req.query["wt_tg"]
    } 

    if(req.query["userID"]) {
    	query["user_id"] =  req.query["userID"] 
    }
    if(req.query["trade_date"]) {
    	query["last_trade_date"] =  req.query["trade_date"] 
    }
    console.info(col)
    var opt = {}
    if(contestId) {
    	opt["ap_tg"] = query["ap_tg"]
    }
    _getScoreLastTradeDate(col, opt, function(tradeDate) {
    	query["last_trade_date"] = req.query["trade_date"]  || tradeDate
    	if(req.query["allScores"] && !contestId) {
	    	delete query["ap_tg"]
	    	delete query["wt_tg"]
	    }
    	console.info(query)
	    features.find(query).toArray(function(err, data) {
	    	if(!err && data && data.length >0 ) {
	    		var results = []
	    		if(!req.query["userID"]) { // no specific user
		    		for(var i in data) {
		    			var fdtScore = data[i];
						results.push(mongoResult(fdtScore))
		    		}
		    		res.json(results)
		    	} else {
		    		if(req.query["debug"] )
		    			res.json(data);
		    		else {
		    			res.json(mongoResult(data[0]));
		    		}
		    	}
	        	
	         } else {
	        	res.json([])
	        }
	    })
	}, req.query["region"])
});

function mongoResult(fdtScore) {
	var data =  {
		user_id : fdtScore.user_id,
		consistency : fdtScore.consistency,
		activity : fdtScore.activity,
		profitability : fdtScore.profitability,
		riskCtrl : fdtScore.riskCtrl,
		fdt : fdtScore.fdt,
		ts : fdtScore.ts,
		
		// rank_percentage : fdtScore.cntst_rk_per,
	}
	if(fdtScore.ft_up && fdtScore.ft_up.raw) {
		data.roi = (fdtScore.ft_up.raw - 1) * 100
	} else {
		data.roi = 0
	}
	return data;
}
router.post('/getTradeSide', function(req,res, next) {
	var db = ""
	if(req.body.db == "CN") {
		db = "lts_china"
	} else if(req.body.db== "INC") {
		db = "lts_china"
	}  else if(req.body.db == "SEED" || req.body.db == "SEEDSC" || req.body.db == "SEEDFT") {
		db = "LTS4LT_Global"
	} else {
		db = "LTS_Global"
	}
	var suffix = "_";
	if(req.body.db == "CN") {
		if(req.body.app == "FX") {
			suffix += "c1"
		} else if(req.body.app == "FC") {
			suffix += "f1"
		} else {
			suffix += "t1"
		}
	} else if(req.body.db == "INC") {
		suffix += "c1"
	} else if(req.body.db == "SEED") {
		suffix += "S2"
	} else if(req.body.db == "SEEDSC") {
		suffix += "T1"
	} else {
		suffix += "S1"
	}
	var colName = ""
	if(req.body.db == "CN") {
		colName = db + "_" + req.body.app.toLowerCase() + suffix + ".executions"
	} else {
		colName = db + "_" + req.body.app + ".EXECUTIONS"
	}
	console.info(colName)
	// var execu = mongodb.collection(colName)
	// if(req.body.db != "CN") {
	// 	execu = awsMongodb.collection(colName)
	// } 
 //    console.info(req.body.objIds)
 //    if(req.body.db != "SEEDSC") {
	//     execu.find({"OBJECT_ID" : {"$in" : req.body.objIds}}).toArray(function(err, data) {
	//     	if(!err) {
	//         	res.json(data)
	//     	}
	//         else 
	//         	res.json(err)
	//     })
	// } else {
		var ids = req.body.objIds.join("','") 
		var sql = "select * from " + colName + " where object_id in ('" + ids + "')"
		console.info(sql)
		_query(req.body.db, sql, function(err, result) {
			res.json(result)
		})
		
	// }
});

function _getRealTimeQuote(cb) {

	var opt = {
		headers : {
			"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
		
		},
		"encoding": 'binary',
		url : "http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?num=10000&sort=changepercent&asc=0&node=hs_a&symbol=&_s_r_a=page&page=1"
	}
	console.info(opt)
	request(opt,function(error, response, html) {

		var buf = new Buffer(html,'binary');
        var str = iconv.decode(buf, 'gb2312');
        
        cb(eval(str))
	   
	})
}

function _getStockHistory(code, cb) {
	var opt = {
		headers : {
			"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
		
		},
		url : "http://api.finance.ifeng.com/akdaily/?code=" + code + "&type=last"
	}
	console.info(opt)
	request(opt,function(error, response, html) {
        cb(JSON.parse(html))	   
	})
}

function _getRealTimeIndex(code, cb) {
	
	var opt = {
		headers : {
			"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
		
		},
		"encoding": 'binary',
		url : "http://hq.sinajs.cn/rn=xppzh&list=sh000001"
	}
	console.info(opt)
	request(opt,function(error, response, html) {
		var buf = new Buffer(html,'binary');
        var str = iconv.decode(buf, 'gb2312');
        client.set("shindex", str.toString())
        cb(str.toString())
	   
	})
	
}


router.get('/getRealTimeQuotes', function(req, res, next) {
	_getRealTimeQuote(function(data) {
		res.json(data)
	})
})

router.get('/getStockHistory', function(req, res, next) {
	_getStockHistory(req.query["symbol"], function(data) {
		res.json(data)
	})
})

router.get('/getRealTimeIndex', function(req, res, next) {
	_getRealTimeIndex(req.query["symbol"], function(data) {
		if(data) {
			data = data.split("\"")[1].split("\"")[0].split(",");
			res.json(data)
		} else {
			res.json([])
		}
		
	})
})

function _getStocksHistory(stockArr, resultArr, cb) {
	if(stockArr.length ==0) {
		cb(resultArr)
	}
	else {
		var code = stockArr.pop()
		var stockCode = ""
		if(code && code.stock_id.indexOf("6") ==0) { // shanghai
			stockCode = "sh" + code.stock_id
		} else {
			stockCode = "sz" + code.stock_id
		}
		var opt = {
			headers : {
				"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
			
			},
			url : "http://api.finance.ifeng.com/akdaily/?code=" + stockCode + "&type=last"
		}
		console.info(opt)
		request(opt,function(error, response, html) {
			var data = JSON.parse(html)
			var histArr = data.record.slice(-5)
			resultArr.push({
				rank : code.rank,
				symbol : code.stock_id,
				histArr : histArr
			})
	   		_getStocksHistory(stockArr, resultArr.reverse(), cb)
		})
	}
}

router.get('/getPredictionHistory', function(req, res, next) {
	if(req.session.userInfo.username == 'sam' ||req.session.userInfo.username== 'bill' || req.session.userInfo.username== 'dap' || req.session.userInfo.username== 'jack') {			
		predicts = ftawsdb.collection("allsc")
		var limit = parseInt(req.query["limit"]) || 50

		predicts.find({"DATA_date" : req.query["date"]},{"_id" : 0 }).sort({"testPred" : -1}).limit(50).toArray(function(err, stocks) {		
			var stockArr = [];

			_getStocksHistory(stocks, [], function(result) {

				res.json(result)
			})
			
		
		})
			
	} else {
		res.json([])
	}

});
	

router.get('/getStockApi', function(req, res, next) {
	var op = {};
	if(req.query["options"])
		op = JSON.parse(req.query["options"])	
	tushare.stock[req.query["method"]](op, function(err, data) {
		if(req.query["method"] == "getHistory") {
			if(data && data.record && data.record.length > 0) {
				var j = data.record.slice(-10);
				
				var result = []
				for(var i in j) {
					var obj = {
						date : j[i][0],
						open : j[i][1],
						high : j[i][2],
						close : j[i][3],
						low : j[i][4],
						vol : j[i][5],
						turnoverratio : j[i][14],
 					}
					
					result.push(obj)
				} 
				res.json(result)
			} else {
				res.json([])
			}

		} else {
	  		res.json(data);
	  	}
	});
	
});





router.get('/getCoreUserTotal', function(req, res, next) {	
 	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	var tCount = 100;
	if(req.query["app"] == "SC")
		tCount = 50;
	var sql = "SET @TRADE_DATE :=NULL; SELECT @TRADE_DATE :=MAX(TRADE_DATE) as TRADE_DATE FROM %s_%s.ACCOUNTS_DAILY; SELECT life_day.mdate, cnt.user_id, cnt.tradescount, life_day.td_life, life_day.td_day FROM (SELECT user_id, tradescount FROM %s_%s.ACCOUNTS_DAILY WHERE TRADE_DATE=(SELECT MAX(TRADE_DATE) FROM %s_%s.ACCOUNTS_DAILY) AND tradescount > %s AND user_id NOT LIKE '%R2015%') AS cnt, (SELECT trader, max(modified) as mdate, datediff(max(modified),min(modified)) +1 AS td_life, count(DISTINCT(DATE(modified))) AS td_day FROM %s_%s.CHILD_ORDER_AUDIT WHERE trader NOT LIKE '%-R2015%' AND DATE(MODIFIED) <= curdate() GROUP BY trader HAVING td_life > 30 AND td_day > 15) AS life_day WHERE cnt.user_id = life_day.trader ORDER BY cnt.tradescount, life_day.td_life, life_day.td_day DESC;"
	//var sql = "SET @TRADE_DATE :=NULL; SELECT @TRADE_DATE :=MAX(TRADE_DATE) as TRADE_DATE FROM %s_%s.ACCOUNTS_DAILY; SELECT life_day.mdate, life_day.td_life as life, cnt.user_id as user_id FROM (SELECT user_id, tradescount FROM %s_%s.ACCOUNTS_DAILY WHERE trade_date = @TRADE_DATE AND tradescount > 100 AND user_id NOT LIKE '%-R2015%') AS cnt, (SELECT  trader, max(modified) as mdate, datediff(max(modified),min(modified)) AS td_life, count(DISTINCT(DATE(modified))) AS td_day FROM %s_%s.CHILD_ORDER_AUDIT WHERE trader NOT LIKE '%-R2015%' AND DATE(MODIFIED) <=@TRADE_DATE GROUP BY trader  HAVING td_life > 30 AND td_day > 15) AS life_day WHERE cnt.user_id = life_day.trader ORDER BY cnt.tradescount, life_day.td_life, life_day.td_day DESC; "
		sql =util.format(sql, db, req.query["app"], db, req.query["app"], db, req.query["app"], tCount, db, req.query["app"])
	_query(req.query["db"], sql, function(err, result) {
		if(!err) {
			var data = result[2], coreUsers = [], uidsList = [];
			for(var i in data) {
				if(Date.parse(new Date()) - Date.parse(data[i].mdate) < 1000*60*60*24*30 ) {
					uidsList.push(data[i].user_id)
					coreUsers.push(data[i])
				}
			}
			console.info(uidsList)
			res.send(coreUsers);
		}
		else
			res.send(err)
	})
});

// router.get('/getCoreUserTotal', function(req, res, next) {	
//  	if(req.query["db"] == "CN") {
// 		db = "lts_china"
// 	} else {
// 		db = "LTS_Global"
// 	}
	
// 	var sql = "SET @TRADE_DATE :=NULL; SELECT @TRADE_DATE :=MAX(TRADE_DATE) as TRADE_DATE FROM %s_%s.ACCOUNTS_DAILY; SELECT life_day.td_life as life, cnt.user_id as user_id FROM (SELECT user_id, tradescount FROM %s_%s.ACCOUNTS_DAILY WHERE trade_date = @TRADE_DATE AND tradescount > 100 AND user_id NOT LIKE '%-R2015%') AS cnt, (SELECT trader, datediff(max(modified),min(modified)) AS td_life, count(DISTINCT(DATE(modified))) AS td_day FROM %s_%s.CHILD_ORDER_AUDIT WHERE trader NOT LIKE '%-R2015%' AND DATE(MODIFIED) <=@TRADE_DATE GROUP BY trader HAVING td_day > 15) AS life_day WHERE cnt.user_id = life_day.trader ORDER BY cnt.tradescount, life_day.td_life, life_day.td_day DESC; "
// 		sql =util.format(sql, db, req.query["app"], db, req.query["app"], db, req.query["app"])
// 	_query(req.query["db"], sql, function(err, result) {
// 		if(!err)
// 			res.send(result[2]);
// 		else
// 			res.send(err)
// 	})
// });
router.get('/getCoreUserBySchool', function(req, res, next) {	
 	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	var schoolFilter= "", dayRange= ""
	if(req.query["school_key"] == "all") {
		schoolFilter = "COUNTRY='" + req.query["db"] + "'";
	} else {
		schoolFilter = "school_key=(select max(school_key) from " + db + ".AUTH where school_key ='" + req.query["school_key"] + "')"
	}
	var sql = "SET @TRADE_DATE :=NULL; SELECT @TRADE_DATE :=MAX(TRADE_DATE) as TRADE_DATE FROM %s_%s.ACCOUNTS_DAILY; SELECT life_day.td_life as life, cnt.user_id as user_id FROM (SELECT user_id, tradescount FROM %s_%s.ACCOUNTS_DAILY WHERE trade_date = @TRADE_DATE AND tradescount > 100 AND user_id NOT LIKE '%-R2015%') AS cnt, (SELECT trader, datediff(max(modified),min(modified)) AS td_life, count(DISTINCT(DATE(modified))) AS td_day FROM %s_%s.CHILD_ORDER_AUDIT WHERE trader NOT LIKE '%-R2015%' AND DATE(MODIFIED) <=@TRADE_DATE GROUP BY trader HAVING td_day > 15) AS life_day, %s.AUTH as auth WHERE cnt.user_id = life_day.trader and  cnt.user_id = auth.userid and auth.%s ORDER BY cnt.tradescount, life_day.td_life, life_day.td_day DESC;"
	sql =util.format(sql, db, req.query["app"], db, req.query["app"], db, req.query["app"], db, schoolFilter)
	_query(req.query["db"], sql, function(err, result) {
		if(!err)
			res.send(result[2]);
		else
			res.send(err)
	})
});
router.get('/getSeedList', function(req, res, next) {	
 
	_query("SEED", "SET @TRADE_DATE :=NULL; SELECT @TRADE_DATE :=MAX(TRADE_DATE) as TRADE_DATE FROM LTS4LT_Global_FX_S2.ACCOUNTS_DAILY; SELECT @TRADE_DATE, a.USER_ID, a.UNIT_PRICE*a.CASH_DEPOSITED AS ACCOUNT_VALUE, a.PNL, a.UR_PNL, a.ALL_TIME_PNL, SUM(b.QUANTITY) as SUMQTY, count(b.QUANTITY) as CNTQTY, a.CASH, a.Margin, a.Ranking, a.WinRatio, a.BiggestWin, a.BiggestLoss, sharp.AllTimeSharpRatio FROM LTS4LT_Global_FX_S2.ACCOUNTS_DAILY a LEFT JOIN (SELECT * FROM LTS4LT_Global_FX_S2.EXECUTIONS WHERE TRADE_DATE = @TRADE_DATE) b ON a.USER_ID=b.TRADER LEFT JOIN (select user_id, avg(pnlrate)/std(pnlrate) as AllTimeSharpRatio  from LTS4LT_Global_FX_S2.ACCOUNTS_DAILY GROUP BY user_id) sharp on sharp.user_id = a.USER_ID where a.TRADE_DATE = @TRADE_DATE GROUP BY a.USER_ID;", function(err, result) {
		if(!err) {
			if(req.query["format"] == "csv") {
				var headers = {};
                for (key in result[2][0]) {
                    headers[key] = key;
                }
                var csvData = result[2].slice();
                csvData.unshift(headers);
				res.csv(csvData);
			} else
				res.send(result[2]);
		}
		else
			res.send(err)
	}, true)
});

router.get('/getSeedSummary', function(req, res, next) {	
	
	_query("SEED", "SET @TRADE_DATE :=NULL; SELECT @TRADE_DATE :=MAX(TRADE_DATE) as TRADE_DATE FROM LTS4LT_Global_FX_S2.ACCOUNTS_DAILY; SELECT @TRADE_DATE, SYMBOL, SUM(QTY)*2 as QTY, SUM(AC_PNL) as PNL FROM LTS4LT_Global_FX_S2.CLOSED_POSITIONS WHERE TRADE_DATE=@TRADE_DATE GROUP BY SYMBOL;", function(err, result) {
		if(!err)
			res.send(result[2]);
		else
			res.send(err)
	}, true)
});

router.get('/getSeedCount', function(req, res, next) {	
	
	_query("SEED", "SET @TRADE_DATE :=NULL; SELECT @TRADE_DATE :=MAX(TRADE_DATE) FROM LTS4LT_Global_FX_S2.ACCOUNTS_DAILY; SELECT sum(pnl) as pnl, sum(quant_sum) as qty FROM (SELECT @TRADE_DATE, a.USER_ID, a.UNIT_PRICE*a.CASH_DEPOSITED AS ACCOUNT_VALUE, a.PNL pnl, a.UR_PNL, a.ALL_TIME_PNL, SUM(b.QUANTITY) quant_sum, count(b.QUANTITY), a.CASH, a.Margin, a.Ranking, a.WinRatio, a.BiggestWin, a.BiggestLoss, a.AllTimeSharpRatio FROM LTS4LT_Global_FX_S2.ACCOUNTS_DAILY a LEFT JOIN (SELECT * FROM LTS4LT_Global_FX_S2.EXECUTIONS WHERE TRADE_DATE = @TRADE_DATE) b ON a.USER_ID=b.TRADER WHERE a.TRADE_DATE = @TRADE_DATE GROUP BY a.USER_ID) AS res;", function(err, result) {
		if(!err)
			res.send(result[2][0]);
		else
			res.send(err)
	})
});

router.get('/getIncuList', function(req, res, next) {	
 
	_query("INC", "SET @TRADE_DATE :=NULL; SELECT @TRADE_DATE :=MAX(TRADE_DATE) as TRADE_DATE FROM LTS4INC_Global_FX_S3.ACCOUNTS_DAILY; SELECT @TRADE_DATE, a.USER_ID, a.UNIT_PRICE*a.CASH_DEPOSITED AS ACCOUNT_VALUE, a.PNL, a.UR_PNL, a.ALL_TIME_PNL, SUM(b.QUANTITY) as SUMQTY, count(b.QUANTITY) as CNTQTY, a.CASH, a.Margin, a.Ranking, a.WinRatio, a.BiggestWin, a.BiggestLoss, a.AllTimeSharpRatio FROM LTS4INC_Global_FX_S3.ACCOUNTS_DAILY a LEFT JOIN (SELECT * FROM LTS4INC_Global_FX_S3.EXECUTIONS WHERE TRADE_DATE = @TRADE_DATE) b ON a.USER_ID=b.TRADER LEFT JOIN (select user_id, avg(pnlrate)/std(pnlrate) as AllTimeSharpRatio  from LTS4LT_Global_FX_S2.ACCOUNTS_DAILY GROUP BY user_id) sharp on sharp.user_id = a.USER_ID where a.TRADE_DATE = @TRADE_DATE GROUP BY a.USER_ID;", function(err, result) {
		if(!err) {
			if(req.query["format"] == "csv") {
				var headers = {};
                for (key in result[2][0]) {
                    headers[key] = key;
                }
                var csvData = result[2].slice();
                csvData.unshift(headers);
				res.csv(csvData);
			} else
				res.send(result[2]);
		}
		else
			res.send(err)
	}, true)
});

router.get('/getIncuSummary', function(req, res, next) {	
	
	_query("INC", "SET @TRADE_DATE :=NULL; SELECT @TRADE_DATE :=MAX(TRADE_DATE) as TRADE_DATE FROM LTS4INC_Global_FX_S3.ACCOUNTS_DAILY; SELECT @TRADE_DATE, SYMBOL, SUM(QTY)*2 as QTY, SUM(AC_PNL) as PNL FROM LTS4INC_Global_FX_S3.CLOSED_POSITIONS WHERE TRADE_DATE=@TRADE_DATE GROUP BY SYMBOL;", function(err, result) {
		if(!err)
			res.send(result[2]);
		else
			res.send(err)
	}, true)
});

router.get('/getIncuCount', function(req, res, next) {	
	
	_query("INC", "SET @TRADE_DATE :=NULL; SELECT @TRADE_DATE :=MAX(TRADE_DATE) FROM LTS4INC_Global_FX_S3.ACCOUNTS_DAILY; SELECT sum(pnl) as pnl, sum(quant_sum) as qty FROM (SELECT @TRADE_DATE, a.USER_ID, a.UNIT_PRICE*a.CASH_DEPOSITED AS ACCOUNT_VALUE, a.PNL pnl, a.UR_PNL, a.ALL_TIME_PNL, SUM(b.QUANTITY) quant_sum, count(b.QUANTITY), a.CASH, a.Margin, a.Ranking, a.WinRatio, a.BiggestWin, a.BiggestLoss, a.AllTimeSharpRatio FROM LTS4INC_Global_FX_S3.ACCOUNTS_DAILY a LEFT JOIN (SELECT * FROM LTS4INC_Global_FX_S3.EXECUTIONS WHERE TRADE_DATE = @TRADE_DATE) b ON a.USER_ID=b.TRADER WHERE a.TRADE_DATE = @TRADE_DATE GROUP BY a.USER_ID) AS res;", function(err, result) {
		if(!err)
			res.send(result[2][0]);
		else
			res.send(err)
	})
});


router.get('/getUserScoreList', function(req, res, next) {
	var url = "http://localhost:8098/api/list?field=" + req.query["ft"] + "&desc=" + req.query["desc"] + "&limit=" + req.query["limit"] + "&logincnt=" + req.query["logincnt"] + "&tradecnt=" + req.query["tradecnt"]
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


router.get('/getUserAccDaily', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	}  else if(req.query["db"] == "INC") {
		db = "lts_china"
	}  else if(req.query["db"] == "SEED" || req.query["db"] == "SEEDSC" || req.query["db"] == "SEEDFT") {
		db = "LTS4LT_Global"
	}   else {
		db = "LTS_Global"
	}
	_query(req.query["db"], "select * from " + db + "_" + req.query["app"] + ".ACCOUNTS_DAILY where USER_ID='" + req.query["userID"] + "' order by trade_date desc", function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err);
	}, req.query["refresh"])
});

router.get('/getUserInfoByName', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	}  else if(req.query["db"] == "INC") {
		db = "lts_china"
	}  else if(req.query["db"] == "SEED" || req.query["db"] == "SEEDSC" || req.query["db"] == "SEEDFT") {
		db = "LTS4LT_Global"
	}   else {
		db = "LTS_Global"
	}
	_query(req.query["db"], "select * from " + db + ".AUTH where USERNAME='" + req.query["userName"] + "'", function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	})
});

router.get('/getUserInfo', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	}  else if(req.query["db"] == "INC") {
		db = "lts_china"
	}  else if(req.query["db"] == "SEED" || req.query["db"] == "SEEDSC" || req.query["db"] == "SEEDFT") {
		db = "LTS4LT_Global"
	}  else {
		db = "LTS_Global"
	}
	_query(req.query["db"], "select * from " + db + ".AUTH where USERID='" + req.query["userID"] + "'", function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	}, req.query["refresh"])
});

router.get('/getUserLastLogin', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	}  else if(req.query["db"] == "INC") {
		db = "lts_china"
	}  else if(req.query["db"] == "SEED" || req.query["db"] == "SEEDSC" || req.query["db"] == "SEEDFT") {
		db = "LTS4LT_Global"
	}  else {
		db = "LTS_Global"
	}
	_query(req.query["db"], "select * from " + db + "_" + req.query["app"] + ".USER_LAST_LOGIN where USERID='" + req.query["userID"] + "'", function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	}, req.query["refresh"])
});

router.get('/getUserAccountSetting', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	}  else if(req.query["db"] == "INC") {
		db = "lts_china"
	}  else if(req.query["db"] == "SEED" || req.query["db"] == "SEEDSC" || req.query["db"] == "SEEDFT") {
		db = "LTS4LT_Global"
	}  else {
		db = "LTS_Global"
	}
	_query(req.query["db"], "select * from " + db + "_" + req.query["app"] + ".ACCOUNT_SETTINGS where ACCOUNT_ID='" + req.query["userID"] + "-" + req.query["app"] +"'", function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	}, req.query["refresh"])
});

router.get('/getDailyTrades', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	}  else if(req.query["db"] == "INC") {
		db = "lts_china"
	}  else if(req.query["db"] == "SEED" || req.query["db"] == "SEEDSC" || req.query["db"] == "SEEDFT") {
		db = "LTS4LT_Global"
	}   else {
		db = "LTS_Global"
	}
	var suffix = "_";
	if(req.query["db"] == "CN") {
		if(req.query["app"] == "FX") {
			suffix += "c1"
		} else if(req.query["app"] == "FC") {
			suffix += "f1"
		} else {
			suffix += "t1"
		}
	} else if(req.query["db"] == "INC") {
		suffix += "c1"
	} else if(req.query["db"] == "SEED") {
		suffix += "S2"
	} else if(req.query["db"] == "SEEDSC") {
		suffix += "T1"
	} else {
		suffix += "S1"
	}
	var sqlString = "select '%s' as user_name, trades.trade_date, trades.c as tradeCount, COALESCE(filled.c, 0)  as fillCount from (select count(*) as c, trade_date from %s_%s%s.CHILD_ORDER_AUDIT where trader = '%s' group by trade_date) trades left join (select count(*) as c, trade_date from %s_%s%s.CHILD_ORDER_AUDIT where trader = '%s' and ord_status='FILLED' group by trade_date) filled on trades.trade_date = filled.trade_date"
	sqlString = util.format(sqlString, req.query["userID"], db, req.query["app"], suffix, req.query["userID"], db, req.query["app"], suffix, req.query["userID"])
	_query(req.query["db"], sqlString, function(err, result) {
		if(!err) {
			res.send(result);
		}
		else
			res.send(err)
	}, req.query["refresh"])
});

router.get('/getClosedTrades', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	}  else if(req.query["db"] == "INC") {
		db = "lts_china"
	}  else if(req.query["db"] == "SEED" || req.query["db"] == "SEEDSC" || req.query["db"] == "SEEDFT") {
		db = "LTS4LT_Global"
	}   else {
		db = "LTS_Global"
	}
	var suffix = "_";
	if(req.query["db"] == "CN") {
		if(req.query["app"] == "FX") {
			suffix += "c1"
		} else if(req.query["app"] == "FC") {
			suffix += "f1"
		} else {
			suffix += "t1"
		}
	} else if(req.query["db"] == "INC") {
		suffix += "c1"
	} else if(req.query["db"] == "SEED") {
		suffix += "S2"
	} else if(req.query["db"] == "SEEDSC") {
		suffix += "T1"
	} else {
		suffix += "S1"
	}
	var sqlString = "select * from %s_%s%s.CLOSED_POSITIONS where USER_ID='%s'"
	sqlString = util.format(sqlString, db, req.query["app"], suffix, req.query["userID"])
	_query(req.query["db"], sqlString, function(err, result) {
		if(!err) {
			if(req.query["format"] == "csv") {
				var headers = {};
                for (key in result[0]) {
                    headers[key] = key;
                }
                var csvData = result.slice();
                csvData.unshift(headers);
				res.csv(csvData);
			} else 
				res.send(result);
		}
		else
			res.send(err)
	}, req.query["refresh"])
});

router.get('/getDailyLogin', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	}  else if(req.query["db"] == "INC") {
		db = "lts_china"
	}  else if(req.query["db"] == "SEED" || req.query["db"] == "SEEDSC" || req.query["db"] == "SEEDFT") {
		db = "LTS4LT_Global"
	}   else {
		db = "LTS_Global"
	}
	var sqlString = "select count(*) as count, date(datetime1) as date from %s_%s.LLSR where user = '%s' group by date(datetime1)"
	sqlString = util.format(sqlString, db, req.query["app"],req.query["userID"])
	_query(req.query["db"], sqlString, function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	}, req.query["refresh"])
});


router.get('/getSeedSCStat', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	}  else if(req.query["db"] == "INC") {
		db = "lts_china"
	}  else if(req.query["db"] == "SEED" || req.query["db"] == "SEEDSC" ) {
		db = "LTS4LT_Global"
	}   else {
		db = "LTS_Global"
	}
	var suffix = "_";
	if(req.query["db"] == "CN") {
		if(req.query["app"] == "FX") {
			suffix += "c1"
		} else if(req.query["app"] == "FC") {
			suffix += "f1"
		} else {
			suffix += "t1"
		}
	} else if(req.query["db"] == "INC") {
		suffix += "c1"
	} else if(req.query["db"] == "SEED") {
		suffix += "S2"
	} else if(req.query["db"] == "SEEDSC") {
		suffix += "T1"
	} else {
		suffix += "S1"
	}
	var sqlString = "";
	if(req.query["type"] == "eff") {
		sqlString = " select USER_ID, trade_date, (sum(PNL) - sum(commission)) / sum(qty*(sell_price + buy_price)/2) as daily_eff from %s_%s%s.CLOSED_POSITIONS where user_id = '%s' group by trade_date order by trade_date;"	
	}
	if(req.query["type"] == "pos") {
		sqlString = "select USER_ID, symbol, sum(qty*(sell_price + buy_price)/2) as total_volumn from %s_%s%s.CLOSED_POSITIONS where user_id = '%s' group by symbol order by total_volumn desc;"	
	}
	if(req.query["type"] == "pnl") {
		sqlString = "select USER_ID, symbol, sum(PNL) / sum(qty*(sell_price + buy_price)/2) as total_eff from %s_%s%s.CLOSED_POSITIONS where user_id = '%s' group by symbol order by total_eff desc;"	
	}
	if(req.query["type"] == "commision") {
		sqlString = "select USER_ID, trade_date, sum(COMMISSION) as daily_commission from %s_%s%s.CLOSED_POSITIONS where user_id = '%s' group by trade_date order by trade_date;"	
	}
	 
	sqlString = util.format(sqlString, db, req.query["app"], suffix, req.query["userID"])
	_query(req.query["db"], sqlString, function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	}, req.query["refresh"])
});




router.get('/getUserOpenPositions', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	}  else if(req.query["db"] == "INC") {
		db = "lts_china"
	}  else if(req.query["db"] == "SEED" || req.query["db"] == "SEEDSC" || req.query["db"] == "SEEDFT") {
		db = "LTS4LT_Global"
	}   else {
		db = "LTS_Global"
	}
	var suffix = "_";
	if(req.query["db"] == "CN") {
		if(req.query["app"] == "FX") {
			suffix += "c1"
		} else if(req.query["app"] == "FC") {
			suffix += "f1"
		} else {
			suffix += "t1"
		}
	} else if(req.query["db"] == "INC") {
		suffix += "c1"
	} else if(req.query["db"] == "SEED") {
		suffix += "S2"
	} else if(req.query["db"] == "SEEDSC") {
		suffix += "T1"
	} else {
		suffix += "S1"
	}
	_query(req.query["db"], "select sum(qty) qty, SYMBOL from " + db + "_" + req.query["app"] + suffix +".OPEN_POSITIONS where USER_ID='" + req.query["userID"] + "' group by SYMBOL", function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	}, req.query["refresh"])
});
router.get('/getUserRiskScore', function(req, res, next) {
	request("http://121.43.73.191:8081/profile?userid=" + req.query["userID"],function(error, response, html) {
		var jsonObj = JSON.parse(html);
		res.json(jsonObj)	
	})
});

router.get('/getSchoolUserGrowth', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	var schoolFilter= ""
	if(req.query["school_key"] == "all") {
		schoolFilter = "COUNTRY='" + req.query["db"] + "'";
	} else {
		schoolFilter = "school_key='" + req.query["school_key"] + "'"
	}
 
	_query(req.query["db"], "set @total_num:=0;select on_date as date, daily_user_num, @total_num:=@total_num+daily_user_num total_user_num from (select date(created) on_date, count(*) daily_user_num from " + db + ".AUTH where " + schoolFilter + " group by date(created) ) a;", function(err, result) {
		if(!err)
			res.send(result[1]);
		else
			res.send(err)
	})
});

router.get('/getSchoolUserCountByApp', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	var schoolFilter= ""
	if(req.query["school_key"] == "all") {
		schoolFilter = "COUNTRY='" + req.query["db"] + "'";
	} else {
		schoolFilter = "school_key=(select max(school_key) from " + db + ".AUTH where school_key ='" + req.query["school_key"] + "')"
	}
	_query(req.query["db"], "select max(school_name) school_name, school_key , count(*) totalUser, sum(thisMonthActive) monthlyActiveUser, sum(thisWeekActive) weeklyActiveUser from (select a.userId, school_name, school_key, ifnull(thisMonthActive,0) thisMonthActive, ifnull(thisWeekActive,0) thisWeekActive from ((select userid, school_name,school_key from " + db + ".AUTH where " + schoolFilter + " ) a LEFT JOIN (select 1 thisMonthActive,userid from " + db + "_" + req.query["app"] + ".USER_LAST_LOGIN where datediff(curdate(),DATE_ADD(loginat, INTERVAL 8 HOUR))<=30  ) b ON a.userid=b.userId LEFT JOIN (select 1 thisWeekActive,userid from " + db + "_" + req.query["app"] + ".USER_LAST_LOGIN where datediff(curdate(),DATE_ADD(loginat, INTERVAL 8 HOUR))<=7  ) c ON a.userid=c.userId) ) d;", function(err, result) {
		if(!err)
			res.send(result[0]);
		else
			res.send(err)
	})
});

router.get('/getSchoolUserCount', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	_query(req.query["db"], "select max(school_name) school_name, school_key , count(*) totalUser, sum(thisMonthActive) monthlyActiveUser, sum(thisWeekActive) weeklyActiveUser from (select a.userId, school_name, school_key, ifnull(thisMonthActive,0) thisMonthActive, ifnull(thisWeekActive,0) thisWeekActive from ((select userid, school_name,school_key from " + db + ".AUTH where school_key=(select max(school_key) from " + db + ".AUTH where school_key ='" + req.query["school_key"] + "') ) a LEFT JOIN (select 1 thisMonthActive,userid from " + db + "_FX.USER_LAST_LOGIN where datediff(curdate(),DATE_ADD(loginat, INTERVAL 8 HOUR))<=30  ) b ON a.userid=b.userId LEFT JOIN (select 1 thisWeekActive,userid from " + db + "_FX.USER_LAST_LOGIN where datediff(curdate(),DATE_ADD(loginat, INTERVAL 8 HOUR))<=7  ) c ON a.userid=c.userId) ) d;", function(err, result) {
		if(!err)
			res.send(result[0]);
		else
			res.send(err)
	})
});

router.get('/getScTradeDate', function(req, res, next) {
	_query("CN", "select DATE from lts_china_sc.trade_date order by DATE desc limit 1", function(err, result) {
		if(!err)
			res.send(result[0]);
		else
			res.send(err)
	}, true)
});

router.get('/getContestCount', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	_query(req.query["db"], "select count(*) as count from " + db + "_FX.CONTEST", function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	})
});

router.get('/getSchools', function(req, res, next) {
	var db = ""
	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	_query(req.query["db"], "select distinct school_name, school_key, school_region from " + db + ".AUTH", function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	})
});

function _cacheManagerRead(key, cb) {
	key = "cache##" + key
	client.get(key, function(err, data) {
		cb(err, JSON.parse(data))
	})
}

function _cacheManagerWrite(key, value) {
	key = "cache##" + key
	client.set(key, value)
}

function _query (poolName, query, cb, isRefreshing) {
	var pool
	if(poolName == "CN" || poolName == "INC") {
		pool = poolAliyun;
	} else if(poolName == "SEED") { 
		pool = poolIDC
	} else if(poolName == "SEEDSC" || poolName == "SEEDFT") { 
		pool = poolSeedSC
	} else {
		pool = poolAWS
	}
	_cacheManagerRead(query + "##|" + poolName , function(err, data) {
		if(!err && data && !isRefreshing) {
			console.info("### Cache Hit ####")
			cb(null, data)
		} else {

			pool.getConnection(function(err, connection) {
				//console.info(poolName)
				console.info(query)
				if(connection) {
					connection.query(query, function(err, rows, fields) {
					  if (err) cb(null);
					  	//cacheQuery[query + "##|" + poolName] = rows
					  	else {
						  	_cacheManagerWrite(query + "##|" + poolName, JSON.stringify(rows))
						  	cb(null, rows)
						}
					  connection.release();
					});
				} else {
					cb("no connection")
				}
			});
		}
	})

}

// router.get('/getCurrentQuerys', function(req, res, next) {
// 	res.json(cacheQuery)
	
// });



// setInterval(function() {
// 	_refreshCache()
// }, 1000 * 60 * 60 * 6) // 4 hours

router.get('/getContestByApp', function(req, res, next) {
	var db = "";
	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	var schoolFilter= ""
	if(req.query["school_key"] == "all") {
		schoolFilter = "COUNTRY='" + req.query["db"] + "'";
	} else {
		schoolFilter = "school_key='" + req.query["school_key"] + "'"
	}
	if(req.query["userID"]) { //get user contest info
		schoolFilter = "USERID='" + req.query["userID"] + "'"
	}
	_query(req.query["db"], "select * from " + db + "_" + req.query["app"] + ".CONTEST where end_date >= curdate()", function(err, result) {
		if(!err) {
			var contests = result;
			var sql = "", tmpSql = [];
			if(contests) {
				for(var i = 0 ; i < contests.length; i ++) {
					tmpSql.push("select distinct user_id, '" + contests[i].CONTEST_NAME  + "' as name, contest_id,RANKING from " + db + "_" + req.query["app"] + "." + contests[i].CONTEST_ID + "_" + req.query["app"].toLowerCase() + " as auth where user_id in (select convert(userid using utf8) from " + db + ".AUTH where "+ schoolFilter +" and Date = (select max(Date) from " + db + "_" + req.query["app"] + "." + contests[i].CONTEST_ID + "_" + req.query["app"].toLowerCase() + ")) ")				
				}
				var sqlUnion = tmpSql.join(" union ")
				var sql = "select count(*) as count, contest_id, name, RANKING from (" + sqlUnion + ") tmp group by contest_id"
				_query(req.query["db"], sql, function(err, result) {
					if(!err)
						res.send(result);
					else
						res.send(err)
				})
			} else {
				res.send([])
			}
		} else
			res.send(err)
	})
});
router.get('/getUserRanking', function(req, res, next) {
	var db = "";
	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	if(req.query["school_key"] == "all") {
		schoolFilter = "COUNTRY='" + req.query["db"] + "'";
	} else {
		schoolFilter = "school_key='" + req.query["school_key"] + "'"
	}
	_query(req.query["db"], "select biggestloss, ranking, auth.created, tradescount, unit_price, user_id, auth.username, auth.serving_url from " + db + "_" + req.query["app"] + ".ACCOUNTS_DAILY ad, (select created, userid, username, serving_url from " + db +".AUTH where " + schoolFilter + ") auth where ad.trade_date = (select max(trade_date) from " + db + "_" + req.query["app"] + ".ACCOUNTS_DAILY) and ad.user_id= auth.userid order by unit_price desc limit 100;", function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	})
});

router.get('/getChannelDist', function(req, res, next) {
	var db = "";
	if(req.query["db"] == "CN") {
		db = "lts_china"
	} else {
		db = "LTS_Global"
	}
	
	_query(req.query["db"], "select channel,count(*) as count from " + db + ".social_im_user where channel is not NULL group by channel", function(err, result) {
		if(!err)
			res.send(result);
		else
			res.send(err)
	})
});

router.get('/getRegionDist', function(req, res, next) {
	var dataFiles = req.query["file"].split("|");
	var obj = {}
	for(var i = 0; i < dataFiles.length; i ++) {
		obj[dataFiles[i]] = JSON.parse(fs.readFileSync('json/' + dataFiles[i] + '.js'));
		var chinaTotal = JSON.parse(fs.readFileSync('json/Date_TU_China.js'));
		obj[dataFiles[i]].push({Country: "CN", "Total Users" : chinaTotal[chinaTotal.length-1]["Total Users"]})
  	}
	res.json({
		chartName : req.query["chartName"],
		data : obj
	});
	
});
var statHearder = {"name" :"渠道名称", "channel_atv_1d":"激活数","atv_ratio":"激活数环比","channel_reg_1d":"注册数","reg_ratio":"注册数环比","convert_rate":"转化率","channel_login_1d":"活跃数","login_ratio":"活跃数环比","channel_old_login_1d":"活跃老用户","old_login_ratio":"活跃老用户比","channel_trade_1d":"交易用户数","trade_rate":"交易率","trade_ratio":"交易用户环比","channel_contest_1d":"比赛用户","contest_ratio":"比赛用户环比"}
  
router.get('/getStatDailyFromFile', function(req, res, next) {
	var filePath = 'report/channel_users/' + req.query["file"] + "/"	
	var files = fs.readdirSync(filePath)	
	var datas = []
	for(var i in files) {
		try {
			var str = fs.readFileSync(filePath + files[i]).toString().replace(/NaN/g, '"NaN"')
			var obj = JSON.parse(str)
			for(var k in obj) {
				if(k && k.indexOf("2d") >=0) {
					delete obj[k]
				}
			}
	        obj.name = files[i] 
			datas.push(obj)
		}catch(e) {
			console.info("invalid json file " + e)
		}
	}
  	if(req.query["format"] == "csv") {
		var headers = {}, csvArr = [];
        for (key in datas[0]) {
            headers[key] = statHearder[key];
        }
        var csvData = datas.slice();
        csvData.unshift(headers);
		res.csv(csvData);
	} else
		res.json(datas);
	
});

router.get('/getDailyTrend', function(req, res, next) {		
	var obj = JSON.parse(fs.readFileSync('report/channel_users/trend/' + req.query["file"] ))
	var result = [obj]
  	if(req.query["format"] == "csv") {
		var headers = {};
        for (key in result[0]) {
            headers[key] = key;
        }
        var csvData = result.slice();
        csvData.unshift(headers);
		res.csv(csvData);
	} else
		res.json(obj);
	
});

router.get('/getStatDataFromFile', function(req, res, next) {		
	var obj = JSON.parse(fs.readFileSync('report/channel_users/' + req.query["file"] + '.json'))
	var result = [obj]
  	if(req.query["format"] == "csv") {
		var headers = {};
        for (key in result[0]) {
            headers[key] = key;
        }
        var csvData = result.slice();
        csvData.unshift(headers);
		res.csv(csvData);
	} else
		res.json(obj);
	
});

router.get('/getStatFolder', function(req, res, next) {		
  	
	res.json(getDirectories('report/channel_users/' + req.query["type"]));
	
});

router.get('/getDataFromFile', function(req, res, next) {
	var dataFiles = req.query["file"].split("|");
	var obj = {}
	for(var i = 0; i < dataFiles.length; i ++) {
		obj[dataFiles[i]] = JSON.parse(fs.readFileSync('json/' + dataFiles[i] + '.js'));
  	}
	res.json({
		chartName : req.query["chartName"],
		data : obj
	});
	
});

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

router.get('/getStatFromFile', function(req, res, next) {
	var globalDateTotal = JSON.parse(fs.readFileSync('json/Date_TU_Global.js'));
	var chinaDateTotal = JSON.parse(fs.readFileSync('json/Date_TU_China.js'));
	var globalFXActive = JSON.parse(fs.readFileSync('json/Date_AU_Global_FX.js'));
	var twFXActive = JSON.parse(fs.readFileSync('json/Date_AU_TW_FX.js'));
	var chinaFXActive = JSON.parse(fs.readFileSync('json/Date_AU_China_FX.js'));
	var chinaFCActive = JSON.parse(fs.readFileSync('json/Date_AU_China_FC.js'));
	var chinaSCActive = JSON.parse(fs.readFileSync('json/Date_AU_China_SC.js'));
	var globalNew = JSON.parse(fs.readFileSync('json/Date_NU_Global.js'));
	var chinaNew = JSON.parse(fs.readFileSync('json/Date_NU_China.js'));
	var twNew = JSON.parse(fs.readFileSync('json/Date_NU_TW.js'));

	var obj = {
		totalUser : parseInt(globalDateTotal[globalDateTotal.length -1]["Total Users"]) + parseInt(chinaDateTotal[chinaDateTotal.length -1]["Total Users"]),
		activeUser : parseInt(twFXActive[twFXActive.length -1]["Active Users"])
			+ parseInt(chinaFXActive[chinaFXActive.length -1]["Active Users"])
			+ parseInt(globalFXActive[globalFXActive.length -1]["Active Users"])  
			+ parseInt(chinaFCActive[chinaFCActive.length -1]["Active Users"])
			+ parseInt(chinaSCActive[chinaSCActive.length -1]["Active Users"]) ,
		activeUserOld : parseInt(twFXActive[twFXActive.length -2]["Active Users"])
			+ parseInt(chinaFXActive[chinaFXActive.length -2]["Active Users"])
			+ parseInt(globalFXActive[globalFXActive.length -2]["Active Users"])  
			+ parseInt(chinaFCActive[chinaFCActive.length -2]["Active Users"])
			+ parseInt(chinaSCActive[chinaSCActive.length -2]["Active Users"]) ,
		// newUser : parseInt(globalNew[globalNew.length -1]["New Users"])
		// 	+  parseInt(chinaNew[chinaNew.length -1]["New Users"])
		// 	+   parseInt(twNew[twNew.length -1]["New Users"]),
		// newUserOld : parseInt(globalNew[globalNew.length -2]["New Users"])
		// 	+  parseInt(chinaNew[chinaNew.length -2]["New Users"])
		// 	+   parseInt(twNew[twNew.length -2]["New Users"])

	}
	obj.newUser = 0;
	obj.newUserOld = 0;
	for (var i in globalNew) {
		if(globalNew[i].date == req.query["date"])
			obj.newUser += parseInt(globalNew[i]["New Users"])
		if(globalNew[i].date == req.query["oldDate"])
			obj.newUserOld += parseInt(globalNew[i]["New Users"])
	}
	for (var i in chinaNew) {
		if(chinaNew[i].date == req.query["date"])
			obj.newUser += parseInt(chinaNew[i]["New Users"])
		if(chinaNew[i].date == req.query["oldDate"])
			obj.newUserOld += parseInt(chinaNew[i]["New Users"])
	}
	for (var i in twNew) {
		if(twNew[i].date == req.query["date"])
			obj.newUser += parseInt(twNew[i]["New Users"])
		if(twNew[i].date == req.query["oldDate"])
			obj.newUserOld += parseInt(twNew[i]["New Users"])
	}
	obj.activePer = parseFloat(obj.activeUser / obj.totalUser) * 100
	obj.newPer = parseFloat(obj.newUser / obj.totalUser) * 100
	obj.newTrend = parseFloat((obj.newUser - obj.newUserOld) / obj.newUserOld) * 100
	obj.activeTrend = parseFloat((obj.activeUser - obj.activeUserOld) / obj.activeUserOld) * 100
	res.json(obj)
});

router.get('/getActiveUserPer', function(req, res, next) {
	var obj = {}	
	var globalDateTotal = JSON.parse(fs.readFileSync('json/Date_TU_Global.js'));
	var chinaDateTotal = JSON.parse(fs.readFileSync('json/Date_TU_China.js'));
	var globalFXActive = JSON.parse(fs.readFileSync('json/Date_AU_Global_FX.js'));
	var twFXActive = JSON.parse(fs.readFileSync('json/Date_AU_TW_FX.js'));
	var chinaFXActive = JSON.parse(fs.readFileSync('json/Date_AU_China_FX.js'));
	var chinaFCActive = JSON.parse(fs.readFileSync('json/Date_AU_China_FC.js'));
	var chinaSCActive = JSON.parse(fs.readFileSync('json/Date_AU_China_SC.js'));
	var chinaTotal = JSON.parse(fs.readFileSync('json/Date_TU_China.js'));
	
	var globalActiveArr = [], chinaActiveArr = [], chinaFx ={}, chinaFc ={}, chinaSc ={}, globalFx = {}, twFx = {};
	for(var i = 0 ; i < chinaFXActive.length; i++) {
		chinaFx[chinaFXActive[i]["date"]] = parseFloat(chinaFXActive[i]["Active Users"])
	}
	for(var i = 0 ; i < chinaFCActive.length; i++) {
		chinaFc[chinaFCActive[i]["date"]] = parseFloat(chinaFCActive[i]["Active Users"])
	}
	for(var i = 0 ; i < chinaSCActive.length; i++) {
		chinaSc[chinaSCActive[i]["date"]] = parseFloat(chinaSCActive[i]["Active Users"])
	}
	for(var i = 0 ; i < globalFXActive.length; i++) {
		globalFx[globalFXActive[i]["date"]] = parseFloat(globalFXActive[i]["Active Users"])
	}
	for(var i = 0 ; i < twFXActive.length; i++) {
		twFx[twFXActive[i]["date"]] = parseFloat(twFXActive[i]["Active Users"])
	}


  	for(var i = 0 ; i < globalDateTotal.length; i++) {
  		var activeUsers = (globalFx[globalDateTotal[i]["date"]] || 0) +  (twFx[globalDateTotal[i]["date"]] || 0)
  		globalActiveArr.push({
  			date : globalDateTotal[i]["date"],
  			"Active Users" :  activeUsers,
  			"Total Users" :  globalDateTotal[i]["Total Users"],
  			"Percentage" : activeUsers/globalDateTotal[i]["Total Users"]*100
  		})
  	}
  	for(var i = 0 ; i < chinaDateTotal.length; i++) {
  		var activeUsers = (chinaFx[chinaDateTotal[i]["date"]] || 0) +  (chinaFc[chinaDateTotal[i]["date"]] || 0)
  			+  (chinaSc[chinaDateTotal[i]["date"]] || 0)
  		chinaActiveArr.push({
  			date : chinaDateTotal[i]["date"],
  			"Active Users" :  activeUsers,
  			"Total Users" :  chinaDateTotal[i]["Total Users"],
  			"Percentage" : activeUsers/chinaDateTotal[i]["Total Users"]*100
  		})
  	}
	res.json({
		chartName : req.query["chartName"],
		global : globalActiveArr,
		china : chinaActiveArr
	});
	
});

function _parseMT4(req, cb) {
	var html = fs.readFileSync("report/" + req.uploadFileName);
	str = iconv.decode(html, 'gb2312');
	console.info("################ Start to parse MT4 file ######################")
	//console.info(str)
	var $ = cheerio.load(str);
	console.info("File vaildation ...")
	if($("meta[name='generator']") && $("meta[name='generator']").attr("content") == "MetaQuotes Software Corp.") {

		var rows = $("table tr");
		if($("table tr") && $("table tr").length > 0 ) {
			var doc = {}
			if(rows.eq(0)) {
				doc = { 
					title : $("b").eq(0).text(),
					account : rows.eq(0).find("td").eq(0).text().split(": ")[1],
					name : rows.eq(0).find("td").eq(1).text().split(": ")[1],
					currency : rows.eq(0).find("td").eq(2).text().split(": ")[1],
					
				}
				if(rows.eq(0).find("td").length == 4) { // chinese version or no leverage 					
					doc.time = rows.eq(0).find("td").eq(3).text();
				} else if(rows.eq(0).find("td").length == 5) {
					doc.leverage = rows.eq(0).find("td").eq(3).text().split(": ")[1];
					doc.time = rows.eq(0).find("td").eq(4).text();
				}
				var trades = [], openTrades = []
				var rows = $("table tr")
				console.info("reading the trade history ...")
				var opSection = false
				for(var i = 2 ; i < rows.length; i++) {
					var cols = rows.eq(i).find("td")
					if(cols.eq(0).text() == "Open Trades:" || cols.eq(0).text() == "当前持有交易:") {
						opSection = true;
						continue;
					}
					if(cols.eq(2).text() == "balance" || cols.eq(2).text() == "credit") { // transfer deposite
						var t = {
							ticketId : cols.eq(0).text(),
							type : cols.eq(2).text(),							
							profit : parseFloat(cols.eq(4).text().replace(/\s+/g, '')),
						}
						//console.info("record valided")
						trades.push(t)
					} else {
						if(!cols.attr("colspan") && !opSection 
							&& cols.eq(0).text() != "Ticket" && cols.eq(0).text() != "挂单号" 
							&& cols.eq(13).text() != "" // no profit, skip this txn
							) {
							var symbol = _symbolExtractor(cols.eq(4).text())
							var t = {
								ticketId : cols.eq(0).text(),
								openTime : cols.eq(1).text(),
								type : cols.eq(2).text(),
								size : cols.eq(3).text(),
								item : symbol,
								openPrice : parseFloat(cols.eq(5).text().replace(/\s+/g, '')),
								stopLoss : parseFloat(cols.eq(6).text().replace(/\s+/g, '')),
								takeProfit : parseFloat(cols.eq(7).text().replace(/\s+/g, '')),
								closeTime : cols.eq(8).text(),
								closePrice : parseFloat(cols.eq(9).text().replace(/\s+/g, '')),
								commission : parseFloat(cols.eq(10).text().replace(/\s+/g, '')),
								taxes : parseFloat(cols.eq(11).text().replace(/\s+/g, '')),
								swap : parseFloat(cols.eq(12).text().replace(/\s+/g, '')),
								profit : parseFloat(cols.eq(13).text().replace(/\s+/g, '')),
							}
							//console.info(t)

							trades.push(t)
						} else if(opSection && !cols.attr("colspan") 
							&&  cols.eq(0).text() != "Ticket" && cols.eq(0).text() != "挂单号"
							&& cols.eq(13).text() != "") { //get open postion section
							var symbol = _symbolExtractor(cols.eq(4).text())
							var t = {
								ticketId : cols.eq(0).text(),
								openTime : cols.eq(1).text(),
								type : cols.eq(2).text(),
								size : cols.eq(3).text(),
								item : symbol,
								openPrice : parseFloat(cols.eq(5).text().replace(/\s+/g, '')),
								stopLoss : parseFloat(cols.eq(6).text().replace(/\s+/g, '')),
								takeProfit : parseFloat(cols.eq(7).text().replace(/\s+/g, '')),
								closeTime : cols.eq(8).text(),
								closePrice : parseFloat(cols.eq(9).text().replace(/\s+/g, '')),
								commission : parseFloat(cols.eq(10).text().replace(/\s+/g, '')),
								taxes : parseFloat(cols.eq(11).text().replace(/\s+/g, '')),
								swap : parseFloat(cols.eq(12).text().replace(/\s+/g, '')),
								profit : parseFloat(cols.eq(13).text().replace(/\s+/g, '')),
							}
							openTrades.push(t)							
						}
					}
				}
			}
			//console.info(trades)
			if(trades.length >0) {
				doc.firstTicketId = trades[0].ticketId;
				doc.lastTicketId = trades[trades.length - 1].ticketId;
			}
			doc.trades = trades;
			doc.openTrades = openTrades;
			//doc.uploadUser = req.session.userInfo.username;
			doc.filename = req.uploadFileName;
			console.info(doc)
			var mt4 = ftdb.collection("mt4")
			doc.cTime = Date.parse(new Date())
			mt4.remove({account: doc.account}, function(err) {
				mt4.save(doc, function(errSave, savedObj) {
					if(savedObj.ops && savedObj.ops.length > 0 )
						doc._id = savedObj.ops[0]._id
					doc.trades = []
					_runConvertor(doc.account, cb, doc)
				})
			});
			
		} else {
			cb("无法解析文件，MT4文件格式不符或内容为空")
		}
	} else {
		cb("不是有效的MT4 文件")
	}
}

 function _runConvertor(id, cb, doc) {
 	var exec = require('child_process').exec;
    var cmd = 'python python/convertMT4.py ' + id;

    exec(cmd, function(error, stdout, stderr) {
     	console.info(stderr||stdout)
     	if(doc) {
     		try {	
     			doc.convertMsg = JSON.parse(stderr||stdout)
     		} catch(e) { 
     			doc.convertMsg = {code : 500, message: "Fatal error! Non-supported format."}
     		}
     	}
     	console.info(doc)
     	_runFDTScorer(id, cb, doc)
    });
}

 function _runFDTScorer(id, cb, doc) {
 	var exec = require('child_process').exec;
    var cmd = 'python /home/caochen/mt4/mt4.py ' + id;

    exec(cmd, function(error, stdout, stderr) {
     	console.info(stderr||stdout)
     	if(doc)
     		doc.scoreMsg = stderr||stdout
     	cb(null, doc)
    });
}

router.post('/uploadFile', function(req, res) {
	upload(req, res, function (err) {
	    if (err) {
	      // An error occurred when uploading
	      res.json(err)
	    }
	    _parseMT4(req, function(err, result) {
	    	if(err) {
	    		res.status(500).send(err);
	    		//res.sendStatus(403, {msg : });
	    	} else {
	    		res.json(result)
	    	}
	    })
	    
	    // Everything went fine
	})
	

   
});

router.get('/getScoreDisplay', function(req, res, next) {	

	var col = ftdb.collection("score_display")
	
	col.find({}).toArray(function(err, result) {    	    
		res.json(result[0])
	})
})

router.get('/getMT4ClosedTrades', function(req, res, next) {	

	var col = ftdb.collection("mt4_cp")
	
	col.find({}).toArray(function(err, result) {    	    
		res.json(result)
	})
})

router.get('/getMT4Account', function(req, res, next) {	

	var col = ftdb.collection("mt4")
	
	col.find({account : req.query["account"]}).sort({cTime: -1}).limit(1).toArray(function(err, result) {    	    
		res.json(result)
	})
})


router.get('/getMT4Score', function(req, res, next) {	

	var col = ftdb.collection("mt4_fx")
	
	col.find({user_id : req.query["userId"]}).sort({cTime: -1}).limit(1).toArray(function(err, result) {
		if(result && result.length > 0 )    	    
			res.json(result[0])
		else
			res.json([])
	})
})
 
router.get('/getMT4AccountDaily', function(req, res, next) {	

	var col = ftdb.collection("mt4_ad")
	
	col.find({USER_ID : req.query["userId"]}).sort({TRADE_DATE: -1}).toArray(function(err, result) {
		   	    
		res.json(result)
		
	})
})
router.get('/getFDTScores', function(req,res, next) {
	//var contestID = req.query["contestID"];
	var level = req.query["level"] || "sim"
	var appId = req.query["app_id"];
	var col = appId + "_china_prod"
	if(level == "inc") {
		col = appId + "_china_inc"
	}
	console.info(col)
	var features = ftdb.collection(col)
	var page = parseInt(req.query["page"])
	var limit = parseInt(req.query["limit"])

	var level = req.query["level"] || "sim"
	var skip = page * limit
	var query = {}
	query = {}
    if(req.query["app_id"] && !req.query["ap_tg"]) { //no ap tag
		query["ap_tg"] = appId + "_sim_all"     	
		query["wt_tg"] = "fsw_sim_default"   	
    }
    if(level == "inc") {
		query["wt_tg"] = "fsw_inc_1"
	}
    if(req.query["trade_date"]) {
    	query["last_trade_date"] =  req.query["trade_date"] 
    }
    console.info(query);
    var cursor = features.find(query,{_id: 0, user_id: 1, fdt :1, riskCtrl: 1, profitability: 1, consistency : 1, activity: 1}); 
    cursor.count(function(err, count) {
    	cursor.skip(skip).limit(limit).toArray(function(err, data) {
	    	res.json({
	    		total : count,
	    		result : data
	    	})
	    })
    })
    
});

router.get('/getMT4Users', function(req, res, next) {	

	var col = ftdb.collection("mt4")
	var query = {
		uploadUser : req.session.userInfo.username
	}
	if(req.session.userInfo.viewAllMT4) {
		query = {}
	}
	col.find(query, {trades : 0}).sort({cTime: -1}).toArray(function(err, result) {    	    
		res.json(result)
	})
})

router.get('/downloadMT4File', function(req, res, next) {
	res.set({
	    "Content-Disposition": 'attachment; filename="'+ req.query["filename"].split("-")[1]+'"',
	    
	});
	res.send(fs.readFileSync('report/' + req.query["filename"]));
	
});

router.get('/downloadInc', function(req, res, next) {
	var app = req.query["app"]
	// if(req.query["app"].indexOf("_sim_all") >= 0) {
	// 	app = req.query["app"].replace("_sim_all", "");
	// }
	var dir = 'report/inc/';
	var files = fs.readdirSync(dir);
	var fileNames = []
	for(var i in files) {
		if(files[i].indexOf(".csv")>=0 && files[i].indexOf(app) >= 0 ) {
			if(req.query["region"] == "global" && files[i].indexOf("global") >= 0)
				fileNames.push(files[i])
			else if(files[i].indexOf("global") <0){
				fileNames.push(files[i])
			}
		}
	}
	if(fileNames.length == 0) {
		res.json("Not file found")
	} else {
		fileNames.sort(function(a, b) {
	       	return fs.statSync(dir + b).mtime.getTime() - 
	               fs.statSync(dir + a).mtime.getTime();
	   	});
	   	console.info(fileNames)
	   	res.set({
		    "Content-Disposition": 'attachment; filename="'+ fileNames[0] +'"',	    
		});
		res.send(fs.readFileSync(dir + fileNames[0]));
	}
	
});

var nonfx_symbolList = {
	"GOLD" : "XAUUSD",
	"SILVER" : "XAGUSD",
	"UK_OIL" : "FU_OIL" ,
	"OIL" : "FU_OIL" ,  
	"UKOIL": "FU_OIL" , 
	"USOIL": "FU_OIL", 
	"US_OIL": "FU_OIL", 
	"BRENT": "FU_OIL", 
	"WTI": "FU_OIL",
	"CRUDE" : "FU_CRD",
	"CHINA300" : "FU_CH3", 
	"CSI300" : "FU_CH3",
	"SPX500" : "FU_SX5",
	"US500" : "FU_SX5",
	"ES" : "FU_ES5",   
	"NAS00" : "FU_NAS",
	"US2000" : "FU_NAS",
	"NQ" : "FU_NSQ",
	"GER30" : "FU_GR3",
	"JPN225" : "FU_JP2",
	"FTSE100" : "FU_FT1",
	"HSI" : "FU_HSI",
	"HK50" : "FU_HSI",
	"DXY" : "FU_DXY",
	"CORN" : "FU_CRN",
	"WALLST100" : "FU_WLT"
}



function _isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function _symbolExtractor(symbol) {
	if(symbol.indexOf("pro") >= 0) {
		symbol = symbol.replace("pro", "")
	}
	if(symbol && symbol.split(".").length > 1) { //contains . symbol
		symbol = symbol.split(".")[0]
	}
	if(symbol && symbol.split("-").length > 1) { //contains . symbol
		symbol = symbol.split("-")[0]
	}
	symbol = symbol.replace("_", "").replace("*", "")
	symbol = symbol.toUpperCase()
	// if(symbol.length != 6 || symbol.indexOf("_") >= 0 || _isNumeric(symbol)) {// not a regular fx symbol
		
	return nonfx_symbolList[symbol] || symbol
		
	// } else {
	// 	return symbol;
	// }
}

router.get('/ra/index', function(req, res, next) {
	
	res.render("index.ejs")
})

router.get('/ra/about', function(req, res, next) {
	
	res.render("about.ejs")
})

router.get('/ra/robot', function(req, res, next) {
	
	res.render("robot.ejs")
})

router.get('/ra/riskQ', function(req, res, next) {
	
	res.render("question.ejs")
})

router.get('/ra/risk', function(req, res, next) {
	
	res.render("risk.ejs")
})

router.get('/ra/predict', function(req, res, next) {
	var fcobs = ftawsdb.collection("fc_obs")
	var predicts = ftawsdb.collection("fc_pred")
	var stats = ftawsdb.collection("fc_stats")
	fcobs.find({},{"date" :1}).sort({"date" : -1}).limit(1).toArray(function(err, maxItem) {
		if(maxItem && maxItem.length > 0 && maxItem[0]) {
			var date = req.query["date"] || maxItem[0]["date"]
			fcobs.find({"date" : date},{"_id" : 0 }).sort({"rank" : 1}).toArray(function(err, contracts) {
				//res.json(contracts)
				predicts.find({"date" : date},{"_id" : 0 }).sort({"rank" : 1}).toArray(function(err, preds) {
					stats.find({},{"_id" : 0 }).sort({"rank" : 1}).toArray(function(err, statsResult) {
					res.render("predict", {
						obs : contracts,
						predicts : preds,
						stats : JSON.stringify(statsResult)
					})
				})
				})
			})
		} else {
			res.json([])
		}
	})
})

router.post('/ra/answerQuestion', function(req, res, next) {
	if(req.body.q < 10) {
		var total = parseInt(req.body.total) + parseInt(req.body.answer)
		console.info(req.body)
		res.render("question" + (parseInt(req.body.q) + 1) + ".ejs" , {
			total : total
		})
	} else {
		var total = parseInt(req.body.total) + parseInt(req.body.answer), levelDesc = "" , level = ""
		if(total >= 10 && total <= 20) {
			level = "平穩型";
			levelDesc = "您能承受低度投資風險,而您的投資主要目的為保本,您會偏向收取固回報"
		} else if(total >= 21 && total <= 30) {
			level = "增長型"
			levelDesc = "您能承受中度投資風險,而您的投資主要目的為長期平穩增長,您樂意接受更大波動及風險以取得較高回報和 資本增長"
		} else {
			level = "進取型"
			levelDesc = "您能承受高度投資風險,而您的投資主要目的為達到最高回報,您樂意接受極大波動以取得最高回報"
		}
		var result = Math.round((total-10)/30*9+1)
		console.info(result)
		res.render("riskLevel" , {
			total : JSON.stringify(advisor[result.toString()]["portfolio"]),
			level : level,
			levelDesc : levelDesc,
			advisorMap : JSON.stringify(advisorMap),
			janus : JSON.stringify(janusProducrs[result.toString()]),
			janusName : JSON.stringify(janusName),
			scores : fundRaning,
			janusWeight : janusProducrs[result.toString()],
			janus_2 : JSON.stringify(janusProducrs["2"]),
			janus_5 : JSON.stringify(janusProducrs["5"]),
			janus_10 : JSON.stringify(janusProducrs["10"])


		})
	}
})

router.get('/getAdvise', function(req, res, next) {
	res.json(advisor[req.query["score"]])
})
var advisorMap = {"BND":"美国债券","EMB":"美国企业债券","VPL":"欧洲股票指数","LQD":"新兴市场债券","VGK":"美国整体股票指数","VTI":"环太平洋股票指数","BNDX":"国际债券","VWO":"新兴市场股票指数"}
var advisor = {
	"1" : {"risk_level": 1, "portfolio": {"BND": 38, "EMB": 0, "VPL": 4, "LQD": 0, "VGK": 0, "VTI": 13, "BNDX": 40, "VWO": 5}},
	"2" : {"risk_level": 2, "portfolio": {"BND": 29, "EMB": 0, "VPL": 6, "LQD": 0, "VGK": 3, "VTI": 15, "BNDX": 40, "VWO": 7}},
	"3" : {"risk_level": 3, "portfolio": {"BND": 21, "EMB": 0, "VPL": 8, "LQD": 0, "VGK": 7, "VTI": 16, "BNDX": 40, "VWO": 10}},
	"4" : {"risk_level": 4, "portfolio": {"BND": 18, "EMB": 0, "VPL": 9, "LQD": 0, "VGK": 10, "VTI": 17, "BNDX": 34, "VWO": 12}},
	"5" : {"risk_level": 5, "portfolio": {"BND": 11, "EMB": 3, "VPL": 11, "LQD": 3, "VGK": 12, "VTI": 19, "BNDX": 28, "VWO": 13}},
	"6" : {"risk_level": 6, "portfolio": {"BND": 12, "EMB": 5, "VPL": 12, "LQD": 3, "VGK": 15, "VTI": 21, "BNDX": 17, "VWO": 15}},
	"7" : {"risk_level": 7, "portfolio": {"BND": 4, "EMB": 8, "VPL": 13, "LQD": 6, "VGK": 17, "VTI": 23, "BNDX": 12, "VWO": 17}},
	"8" : {"risk_level": 8, "portfolio": {"BND": 0, "EMB": 11, "VPL": 15, "LQD": 8, "VGK": 20, "VTI": 25, "BNDX": 3, "VWO": 18}},
	"9" : {"risk_level": 9, "portfolio": {"BND": 0, "EMB": 14, "VPL": 15, "LQD": 0, "VGK": 25, "VTI": 25, "BNDX": 0, "VWO": 21}},
	"10" : {"risk_level": 10, "portfolio": {"BND": 0, "EMB": 6, "VPL": 15, "LQD": 0, "VGK": 33, "VTI": 21, "BNDX": 0, "VWO": 26}},
	"11" : {"risk_level": 11, "portfolio": {"BND": 0, "EMB": 3, "VPL": 12, "LQD": 0, "VGK": 40, "VTI": 7, "BNDX": 0, "VWO": 38}}
}

var janusProducrs = {"1":{"0P0000IVNS":0,"0P00000CQF":0,"0P00000CQH":0,"0P00000CQJ":0,"0P00000CQP":0,"0P00000GB6":0,"0P00000GB8":0,"0P00000GEJ":0,"0P00000GG3":0,"0P00005XS0":0,"0P00000IKC":0,"0P00000RMQ":0,"0P00000IKE":0,"0P00000IKM":0,"0P00000IKF":0,"0P00000IKH":0,"0P0000W8BF":0,"0P00000IKT":0.2006,"0P00000CZ4":0,"0P00000IR4":0,"0P00000HPZ":0,"0P00000IR6":0,"0P00000IRA":0,"0P0000ACDR":0,"0P00000RMP":0,"0P00000IQE":0,"0P00000IS9":0,"0P00000ISG":0,"0P0000ZND3":0.2496,"0P0000ACDS":0,"0P00000JWZ":0,"0P00000JX1":0,"0P00000JX5":0,"0P00000JX7":0,"0P0000ACDV":0,"0P00000RMV":0,"0P00000IRO":0,"0P00000IRQ":0,"0P00000IRU":0,"0P00000G5H":0,"0P00000RMX":0,"0P00000IUI":0,"0P00000IUK":0,"0P00000IUO":0.0151,"0P0000AD2M":0,"0P00000EBB":0,"0P00000RMU":0,"0P00000EBC":0,"0P00000IUD":0,"0P00000IUB":0,"0P0000WDI2":0,"0P00000IUH":0,"0P0000ACEW":0,"0P00005XL9":0,"0P00005XRU":0,"0P00005XRY":0,"0P00005XRX":0,"0P00000RPL":0,"0P00000ITG":0,"0P00000RMR":0,"0P00000ITE":0.3193,"0P0000ACEF":0,"0P00000HSG":0,"0P00000HSE":0,"0P00000XMG":0,"0P00000HSK":0,"0P00000HSI":0,"0P00000HSM":0,"0P0000ACEV":0,"0P00000RPM":0,"0P00000ITI":0,"0P00000RMS":0,"0P00000ITM":0,"0P0000ACEH":0,"0P00000ITO":0,"0P00000RMT":0,"0P00000ITQ":0,"0P00000ITU":0,"0P00000ITS":0,"0P00000IU0":0,"0P00000ITY":0.2154,"0P00000G5D":0},"2":{"0P0000IVNS":0,"0P00000CQF":0,"0P00000CQH":0,"0P00000CQJ":0,"0P00000CQP":0,"0P00000GB6":0,"0P00000GB8":0,"0P00000GEJ":0,"0P00000GG3":0,"0P00005XS0":0,"0P00000IKC":0,"0P00000RMQ":0,"0P00000IKE":0,"0P00000IKM":0,"0P00000IKF":0,"0P00000IKH":0,"0P0000W8BF":0,"0P00000IKT":0.4836,"0P00000CZ4":0,"0P00000IR4":0,"0P00000HPZ":0,"0P00000IR6":0,"0P00000IRA":0,"0P0000ACDR":0,"0P00000RMP":0,"0P00000IQE":0,"0P00000IS9":0,"0P00000ISG":0,"0P0000ZND3":0.1942,"0P0000ACDS":0,"0P00000JWZ":0,"0P00000JX1":0,"0P00000JX5":0,"0P00000JX7":0,"0P0000ACDV":0,"0P00000RMV":0,"0P00000IRO":0,"0P00000IRQ":0,"0P00000IRU":0,"0P00000G5H":0,"0P00000RMX":0,"0P00000IUI":0,"0P00000IUK":0,"0P00000IUO":0.0253,"0P0000AD2M":0,"0P00000EBB":0,"0P00000RMU":0,"0P00000EBC":0,"0P00000IUD":0,"0P00000IUB":0,"0P0000WDI2":0,"0P00000IUH":0,"0P0000ACEW":0,"0P00005XL9":0,"0P00005XRU":0,"0P00005XRY":0,"0P00005XRX":0,"0P00000RPL":0,"0P00000ITG":0,"0P00000RMR":0,"0P00000ITE":0.22,"0P0000ACEF":0,"0P00000HSG":0,"0P00000HSE":0,"0P00000XMG":0,"0P00000HSK":0,"0P00000HSI":0,"0P00000HSM":0,"0P0000ACEV":0,"0P00000RPM":0,"0P00000ITI":0,"0P00000RMS":0,"0P00000ITM":0,"0P0000ACEH":0,"0P00000ITO":0,"0P00000RMT":0,"0P00000ITQ":0,"0P00000ITU":0,"0P00000ITS":0,"0P00000IU0":0,"0P00000ITY":0.0769,"0P00000G5D":0},"3":{"0P0000IVNS":0,"0P00000CQF":0,"0P00000CQH":0,"0P00000CQJ":0,"0P00000CQP":0,"0P00000GB6":0,"0P00000GB8":0,"0P00000GEJ":0,"0P00000GG3":0,"0P00005XS0":0,"0P00000IKC":0,"0P00000RMQ":0,"0P00000IKE":0,"0P00000IKM":0,"0P00000IKF":0,"0P00000IKH":0,"0P0000W8BF":0,"0P00000IKT":0.6251,"0P00000CZ4":0,"0P00000IR4":0,"0P00000HPZ":0,"0P00000IR6":0,"0P00000IRA":0,"0P0000ACDR":0,"0P00000RMP":0,"0P00000IQE":0,"0P00000IS9":0,"0P00000ISG":0,"0P0000ZND3":0.1665,"0P0000ACDS":0,"0P00000JWZ":0,"0P00000JX1":0,"0P00000JX5":0,"0P00000JX7":0,"0P0000ACDV":0,"0P00000RMV":0,"0P00000IRO":0,"0P00000IRQ":0,"0P00000IRU":0,"0P00000G5H":0,"0P00000RMX":0,"0P00000IUI":0,"0P00000IUK":0,"0P00000IUO":0.0303,"0P0000AD2M":0,"0P00000EBB":0,"0P00000RMU":0,"0P00000EBC":0,"0P00000IUD":0,"0P00000IUB":0,"0P0000WDI2":0,"0P00000IUH":0,"0P0000ACEW":0,"0P00005XL9":0,"0P00005XRU":0,"0P00005XRY":0,"0P00005XRX":0,"0P00000RPL":0,"0P00000ITG":0,"0P00000RMR":0,"0P00000ITE":0.1704,"0P0000ACEF":0,"0P00000HSG":0,"0P00000HSE":0,"0P00000XMG":0,"0P00000HSK":0,"0P00000HSI":0,"0P00000HSM":0,"0P0000ACEV":0,"0P00000RPM":0,"0P00000ITI":0,"0P00000RMS":0,"0P00000ITM":0,"0P0000ACEH":0,"0P00000ITO":0,"0P00000RMT":0,"0P00000ITQ":0,"0P00000ITU":0,"0P00000ITS":0,"0P00000IU0":0,"0P00000ITY":0.0077,"0P00000G5D":0},"4":{"0P0000IVNS":0,"0P00000CQF":0,"0P00000CQH":0,"0P00000CQJ":0,"0P00000CQP":0,"0P00000GB6":0,"0P00000GB8":0,"0P00000GEJ":0,"0P00000GG3":0,"0P00005XS0":0,"0P00000IKC":0,"0P00000RMQ":0,"0P00000IKE":0,"0P00000IKM":0,"0P00000IKF":0,"0P00000IKH":0,"0P0000W8BF":0,"0P00000IKT":0.6797,"0P00000CZ4":0,"0P00000IR4":0,"0P00000HPZ":0,"0P00000IR6":0,"0P00000IRA":0,"0P0000ACDR":0,"0P00000RMP":0,"0P00000IQE":0,"0P00000IS9":0,"0P00000ISG":0,"0P0000ZND3":0.1554,"0P0000ACDS":0,"0P00000JWZ":0,"0P00000JX1":0,"0P00000JX5":0,"0P00000JX7":0,"0P0000ACDV":0,"0P00000RMV":0,"0P00000IRO":0,"0P00000IRQ":0,"0P00000IRU":0,"0P00000G5H":0,"0P00000RMX":0,"0P00000IUI":0,"0P00000IUK":0,"0P00000IUO":0.0219,"0P0000AD2M":0,"0P00000EBB":0,"0P00000RMU":0,"0P00000EBC":0,"0P00000IUD":0,"0P00000IUB":0,"0P0000WDI2":0,"0P00000IUH":0,"0P0000ACEW":0,"0P00005XL9":0,"0P00005XRU":0,"0P00005XRY":0,"0P00005XRX":0,"0P00000RPL":0,"0P00000ITG":0,"0P00000RMR":0,"0P00000ITE":0.143,"0P0000ACEF":0,"0P00000HSG":0,"0P00000HSE":0,"0P00000XMG":0,"0P00000HSK":0,"0P00000HSI":0,"0P00000HSM":0,"0P0000ACEV":0,"0P00000RPM":0,"0P00000ITI":0,"0P00000RMS":0,"0P00000ITM":0,"0P0000ACEH":0,"0P00000ITO":0,"0P00000RMT":0,"0P00000ITQ":0,"0P00000ITU":0,"0P00000ITS":0,"0P00000IU0":0,"0P00000ITY":0,"0P00000G5D":0},"5":{"0P0000IVNS":0,"0P00000CQF":0,"0P00000CQH":0,"0P00000CQJ":0,"0P00000CQP":0,"0P00000GB6":0,"0P00000GB8":0,"0P00000GEJ":0,"0P00000GG3":0,"0P00005XS0":0,"0P00000IKC":0,"0P00000RMQ":0,"0P00000IKE":0,"0P00000IKM":0,"0P00000IKF":0,"0P00000IKH":0,"0P0000W8BF":0,"0P00000IKT":0.7116,"0P00000CZ4":0,"0P00000IR4":0,"0P00000HPZ":0,"0P00000IR6":0,"0P00000IRA":0,"0P0000ACDR":0,"0P00000RMP":0,"0P00000IQE":0,"0P00000IS9":0,"0P00000ISG":0,"0P0000ZND3":0.1489,"0P0000ACDS":0,"0P00000JWZ":0,"0P00000JX1":0,"0P00000JX5":0,"0P00000JX7":0,"0P0000ACDV":0,"0P00000RMV":0,"0P00000IRO":0,"0P00000IRQ":0,"0P00000IRU":0,"0P00000G5H":0,"0P00000RMX":0,"0P00000IUI":0,"0P00000IUK":0,"0P00000IUO":0.0145,"0P0000AD2M":0,"0P00000EBB":0,"0P00000RMU":0,"0P00000EBC":0,"0P00000IUD":0,"0P00000IUB":0,"0P0000WDI2":0,"0P00000IUH":0,"0P0000ACEW":0,"0P00005XL9":0,"0P00005XRU":0,"0P00005XRY":0,"0P00005XRX":0,"0P00000RPL":0,"0P00000ITG":0,"0P00000RMR":0,"0P00000ITE":0.1251,"0P0000ACEF":0,"0P00000HSG":0,"0P00000HSE":0,"0P00000XMG":0,"0P00000HSK":0,"0P00000HSI":0,"0P00000HSM":0,"0P0000ACEV":0,"0P00000RPM":0,"0P00000ITI":0,"0P00000RMS":0,"0P00000ITM":0,"0P0000ACEH":0,"0P00000ITO":0,"0P00000RMT":0,"0P00000ITQ":0,"0P00000ITU":0,"0P00000ITS":0,"0P00000IU0":0,"0P00000ITY":0,"0P00000G5D":0},"6":{"0P0000IVNS":0,"0P00000CQF":0,"0P00000CQH":0,"0P00000CQJ":0,"0P00000CQP":0,"0P00000GB6":0,"0P00000GB8":0,"0P00000GEJ":0,"0P00000GG3":0,"0P00005XS0":0,"0P00000IKC":0,"0P00000RMQ":0,"0P00000IKE":0,"0P00000IKM":0,"0P00000IKF":0,"0P00000IKH":0,"0P0000W8BF":0,"0P00000IKT":0.7343,"0P00000CZ4":0,"0P00000IR4":0,"0P00000HPZ":0,"0P00000IR6":0,"0P00000IRA":0,"0P0000ACDR":0,"0P00000RMP":0,"0P00000IQE":0,"0P00000IS9":0,"0P00000ISG":0,"0P0000ZND3":0.1442,"0P0000ACDS":0,"0P00000JWZ":0,"0P00000JX1":0,"0P00000JX5":0,"0P00000JX7":0,"0P0000ACDV":0,"0P00000RMV":0,"0P00000IRO":0,"0P00000IRQ":0,"0P00000IRU":0,"0P00000G5H":0,"0P00000RMX":0,"0P00000IUI":0,"0P00000IUK":0,"0P00000IUO":0.0092,"0P0000AD2M":0,"0P00000EBB":0,"0P00000RMU":0,"0P00000EBC":0,"0P00000IUD":0,"0P00000IUB":0,"0P0000WDI2":0,"0P00000IUH":0,"0P0000ACEW":0,"0P00005XL9":0,"0P00005XRU":0,"0P00005XRY":0,"0P00005XRX":0,"0P00000RPL":0,"0P00000ITG":0,"0P00000RMR":0,"0P00000ITE":0.1123,"0P0000ACEF":0,"0P00000HSG":0,"0P00000HSE":0,"0P00000XMG":0,"0P00000HSK":0,"0P00000HSI":0,"0P00000HSM":0,"0P0000ACEV":0,"0P00000RPM":0,"0P00000ITI":0,"0P00000RMS":0,"0P00000ITM":0,"0P0000ACEH":0,"0P00000ITO":0,"0P00000RMT":0,"0P00000ITQ":0,"0P00000ITU":0,"0P00000ITS":0,"0P00000IU0":0,"0P00000ITY":0,"0P00000G5D":0},"7":{"0P0000IVNS":0,"0P00000CQF":0,"0P00000CQH":0,"0P00000CQJ":0,"0P00000CQP":0,"0P00000GB6":0,"0P00000GB8":0,"0P00000GEJ":0,"0P00000GG3":0,"0P00005XS0":0,"0P00000IKC":0,"0P00000RMQ":0,"0P00000IKE":0,"0P00000IKM":0,"0P00000IKF":0,"0P00000IKH":0,"0P0000W8BF":0,"0P00000IKT":0.7513,"0P00000CZ4":0,"0P00000IR4":0,"0P00000HPZ":0,"0P00000IR6":0,"0P00000IRA":0,"0P0000ACDR":0,"0P00000RMP":0,"0P00000IQE":0,"0P00000IS9":0,"0P00000ISG":0,"0P0000ZND3":0.1407,"0P0000ACDS":0,"0P00000JWZ":0,"0P00000JX1":0,"0P00000JX5":0,"0P00000JX7":0,"0P0000ACDV":0,"0P00000RMV":0,"0P00000IRO":0,"0P00000IRQ":0,"0P00000IRU":0,"0P00000G5H":0,"0P00000RMX":0,"0P00000IUI":0,"0P00000IUK":0,"0P00000IUO":0.0053,"0P0000AD2M":0,"0P00000EBB":0,"0P00000RMU":0,"0P00000EBC":0,"0P00000IUD":0,"0P00000IUB":0,"0P0000WDI2":0,"0P00000IUH":0,"0P0000ACEW":0,"0P00005XL9":0,"0P00005XRU":0,"0P00005XRY":0,"0P00005XRX":0,"0P00000RPL":0,"0P00000ITG":0,"0P00000RMR":0,"0P00000ITE":0.1027,"0P0000ACEF":0,"0P00000HSG":0,"0P00000HSE":0,"0P00000XMG":0,"0P00000HSK":0,"0P00000HSI":0,"0P00000HSM":0,"0P0000ACEV":0,"0P00000RPM":0,"0P00000ITI":0,"0P00000RMS":0,"0P00000ITM":0,"0P0000ACEH":0,"0P00000ITO":0,"0P00000RMT":0,"0P00000ITQ":0,"0P00000ITU":0,"0P00000ITS":0,"0P00000IU0":0,"0P00000ITY":0,"0P00000G5D":0},"8":{"0P0000IVNS":0,"0P00000CQF":0,"0P00000CQH":0,"0P00000CQJ":0,"0P00000CQP":0,"0P00000GB6":0,"0P00000GB8":0,"0P00000GEJ":0,"0P00000GG3":0,"0P00005XS0":0,"0P00000IKC":0,"0P00000RMQ":0,"0P00000IKE":0,"0P00000IKM":0,"0P00000IKF":0,"0P00000IKH":0,"0P0000W8BF":0,"0P00000IKT":0.7646,"0P00000CZ4":0,"0P00000IR4":0,"0P00000HPZ":0,"0P00000IR6":0,"0P00000IRA":0,"0P0000ACDR":0,"0P00000RMP":0,"0P00000IQE":0,"0P00000IS9":0,"0P00000ISG":0,"0P0000ZND3":0.138,"0P0000ACDS":0,"0P00000JWZ":0,"0P00000JX1":0,"0P00000JX5":0,"0P00000JX7":0,"0P0000ACDV":0,"0P00000RMV":0,"0P00000IRO":0,"0P00000IRQ":0,"0P00000IRU":0,"0P00000G5H":0,"0P00000RMX":0,"0P00000IUI":0,"0P00000IUK":0,"0P00000IUO":0.0022,"0P0000AD2M":0,"0P00000EBB":0,"0P00000RMU":0,"0P00000EBC":0,"0P00000IUD":0,"0P00000IUB":0,"0P0000WDI2":0,"0P00000IUH":0,"0P0000ACEW":0,"0P00005XL9":0,"0P00005XRU":0,"0P00005XRY":0,"0P00005XRX":0,"0P00000RPL":0,"0P00000ITG":0,"0P00000RMR":0,"0P00000ITE":0.0952,"0P0000ACEF":0,"0P00000HSG":0,"0P00000HSE":0,"0P00000XMG":0,"0P00000HSK":0,"0P00000HSI":0,"0P00000HSM":0,"0P0000ACEV":0,"0P00000RPM":0,"0P00000ITI":0,"0P00000RMS":0,"0P00000ITM":0,"0P0000ACEH":0,"0P00000ITO":0,"0P00000RMT":0,"0P00000ITQ":0,"0P00000ITU":0,"0P00000ITS":0,"0P00000IU0":0,"0P00000ITY":0,"0P00000G5D":0},"9":{"0P0000IVNS":0,"0P00000CQF":0,"0P00000CQH":0,"0P00000CQJ":0,"0P00000CQP":0,"0P00000GB6":0,"0P00000GB8":0,"0P00000GEJ":0,"0P00000GG3":0,"0P00005XS0":0,"0P00000IKC":0,"0P00000RMQ":0,"0P00000IKE":0,"0P00000IKM":0,"0P00000IKF":0,"0P00000IKH":0,"0P0000W8BF":0,"0P00000IKT":0.719,"0P00000CZ4":0,"0P00000IR4":0,"0P00000HPZ":0,"0P00000IR6":0,"0P00000IRA":0,"0P0000ACDR":0,"0P00000RMP":0,"0P00000IQE":0,"0P00000IS9":0,"0P00000ISG":0,"0P0000ZND3":0.1329,"0P0000ACDS":0,"0P00000JWZ":0,"0P00000JX1":0,"0P00000JX5":0,"0P00000JX7":0,"0P0000ACDV":0,"0P00000RMV":0,"0P00000IRO":0,"0P00000IRQ":0,"0P00000IRU":0,"0P00000G5H":0,"0P00000RMX":0,"0P00000IUI":0,"0P00000IUK":0,"0P00000IUO":0,"0P0000AD2M":0,"0P00000EBB":0,"0P00000RMU":0,"0P00000EBC":0,"0P00000IUD":0,"0P00000IUB":0,"0P0000WDI2":0,"0P00000IUH":0.0615,"0P0000ACEW":0,"0P00005XL9":0,"0P00005XRU":0,"0P00005XRY":0,"0P00005XRX":0,"0P00000RPL":0,"0P00000ITG":0,"0P00000RMR":0,"0P00000ITE":0.0866,"0P0000ACEF":0,"0P00000HSG":0,"0P00000HSE":0,"0P00000XMG":0,"0P00000HSK":0,"0P00000HSI":0,"0P00000HSM":0,"0P0000ACEV":0,"0P00000RPM":0,"0P00000ITI":0,"0P00000RMS":0,"0P00000ITM":0,"0P0000ACEH":0,"0P00000ITO":0,"0P00000RMT":0,"0P00000ITQ":0,"0P00000ITU":0,"0P00000ITS":0,"0P00000IU0":0,"0P00000ITY":0,"0P00000G5D":0},"10":{"0P0000IVNS":0,"0P00000CQF":0,"0P00000CQH":0,"0P00000CQJ":0,"0P00000CQP":0,"0P00000GB6":0,"0P00000GB8":0,"0P00000GEJ":0,"0P00000GG3":0,"0P00005XS0":0,"0P00000IKC":0,"0P00000RMQ":0,"0P00000IKE":0,"0P00000IKM":0,"0P00000IKF":0,"0P00000IKH":0,"0P0000W8BF":0,"0P00000IKT":0.631,"0P00000CZ4":0,"0P00000IR4":0,"0P00000HPZ":0,"0P00000IR6":0,"0P00000IRA":0,"0P0000ACDR":0,"0P00000RMP":0,"0P00000IQE":0,"0P00000IS9":0,"0P00000ISG":0,"0P0000ZND3":0.1264,"0P0000ACDS":0,"0P00000JWZ":0,"0P00000JX1":0,"0P00000JX5":0,"0P00000JX7":0,"0P0000ACDV":0,"0P00000RMV":0,"0P00000IRO":0,"0P00000IRQ":0,"0P00000IRU":0,"0P00000G5H":0,"0P00000RMX":0,"0P00000IUI":0,"0P00000IUK":0,"0P00000IUO":0,"0P0000AD2M":0,"0P00000EBB":0,"0P00000RMU":0,"0P00000EBC":0,"0P00000IUD":0,"0P00000IUB":0,"0P0000WDI2":0,"0P00000IUH":0.1669,"0P0000ACEW":0,"0P00005XL9":0,"0P00005XRU":0,"0P00005XRY":0,"0P00005XRX":0,"0P00000RPL":0,"0P00000ITG":0,"0P00000RMR":0,"0P00000ITE":0.0757,"0P0000ACEF":0,"0P00000HSG":0,"0P00000HSE":0,"0P00000XMG":0,"0P00000HSK":0,"0P00000HSI":0,"0P00000HSM":0,"0P0000ACEV":0,"0P00000RPM":0,"0P00000ITI":0,"0P00000RMS":0,"0P00000ITM":0,"0P0000ACEH":0,"0P00000ITO":0,"0P00000RMT":0,"0P00000ITQ":0,"0P00000ITU":0,"0P00000ITS":0,"0P00000IU0":0,"0P00000ITY":0,"0P00000G5D":0}}
var janusName = {"0P0000ZNB6":"駿利歐洲基金A $acc對沖","0P0000IVNS":"駿利歐洲基金A €acc","0P00015GQD":"駿利環球生命科技基金 A HKD$ Acc","0P00000CQF":"駿利資產管理基金 - 柏智美國策略價值基金 A $acc","0P00000CQH":"駿利資產管理基金 - 柏智美國策略價值基金 A €acc","0P00000CQJ":"駿利資產管理基金 - 柏智美國策略價值基金 B $acc","0P00000CQP":"駿利資產管理基金 - 柏智美國策略價值基金 I $acc","0P0000Q5Y6":"駿利資產管理基金 - 柏智環球價值基金 A $acc","0P0000Q5Y7":"駿利資產管理基金 - 柏智環球價值基金 A €acc","0P0000Q5YA":"駿利資產管理基金 - 柏智環球價值基金 I $acc","0P0000Q5Y9":"駿利資產管理基金 - 柏智環球價值基金 I €acc","0P00000GB6":"駿利資產管理基金 - 英達美國重點基金 A $acc","0P00000GB8":"駿利資產管理基金 - 英達美國重點基金 A €acc","0P00000GEJ":"駿利資產管理基金 - 英達美國重點基金 B $acc","0P00000GG3":"駿利資產管理基金 - 英達美國重點基金 I $acc","0P00005XS0":"駿利資產管理基金 - 英達美國重點基金 I €acc","0P0000YE5H":"駿利資產管理基金 - 英達環球股息基金 A $acc","0P0000YE5I":"駿利資產管理基金 - 英達環球股息基金 A $inc","0P0000YE5J":"駿利資產管理基金 - 英達環球股息基金 A €acc","0P0000YE5K":"駿利資產管理基金 - 英達環球股息基金 A €inc","0P00000IKC":"駿利資產管理基金 - 駿利靈活入息基金 A $acc","0P00000RMQ":"駿利資產管理基金 - 駿利靈活入息基金 A $inc","0P0000ZND9":"駿利資產管理基金 - 駿利靈活入息基金 A AUDacc","0P0000YE5X":"駿利資產管理基金 - 駿利靈活入息基金 A AUDinc","0P0000YE5U":"駿利資產管理基金 - 駿利靈活入息基金 A HK$acc","0P0000YE5V":"駿利資產管理基金 - 駿利靈活入息基金 A HK$inc","0P00000IKE":"駿利資產管理基金 - 駿利靈活入息基金 A €acc","0P00000IKM":"駿利資產管理基金 - 駿利靈活入息基金 B $acc","0P00000IKF":"駿利資產管理基金 - 駿利靈活入息基金 B $inc","0P00000IKH":"駿利資產管理基金 - 駿利靈活入息基金 B €inc","0P0000W8BF":"駿利資產管理基金 - 駿利靈活入息基金 I $acc","0P00000IKT":"駿利資產管理基金 - 駿利靈活入息基金 I $inc","0P00000CZ4":"駿利資產管理基金 - 駿利靈活入息基金 I €acc","0P00000IR4":"駿利資產管理基金 - 駿利策略Alpha基金 A $acc","0P00000HPZ":"駿利資產管理基金 - 駿利策略Alpha基金 A €acc","0P00000IR6":"駿利資產管理基金 - 駿利策略Alpha基金 B $acc","0P00000IRA":"駿利資產管理基金 - 駿利策略Alpha基金 I $acc","0P0000ACDR":"駿利資產管理基金 - 駿利策略Alpha基金 I €acc","0P00000RMP":"駿利資產管理基金 - 駿利平衡基金 A $acc","0P0000ZND2":"駿利資產管理基金 - 駿利平衡基金 A $inc","0P0000ZND8":"駿利資產管理基金 - 駿利平衡基金 A AUDacc","0P0000ZND7":"駿利資產管理基金 - 駿利平衡基金 A AUDinc","0P0000ZP53":"駿利資產管理基金 - 駿利平衡基金 A CADinc","0P0000UAJA":"駿利資產管理基金 - 駿利平衡基金 A HK$acc","0P0000ZND6":"駿利資產管理基金 - 駿利平衡基金 A HK$inc","0P00000IQE":"駿利資產管理基金 - 駿利平衡基金 A €acc","0P0000ZND4":"駿利資產管理基金 - 駿利平衡基金 A €inc","0P00000IS9":"駿利資產管理基金 - 駿利平衡基金 B $acc","0P00000ISG":"駿利資產管理基金 - 駿利平衡基金 I $acc","0P0000ZND3":"駿利資產管理基金 - 駿利平衡基金 I $inc","0P0000ACDS":"駿利資產管理基金 - 駿利平衡基金 I €acc","0P00000JWZ":"駿利資產管理基金 - 駿利美國研究基金 A $acc","0P00000JX1":"駿利資產管理基金 - 駿利美國研究基金 A €acc","0P00000JX5":"駿利資產管理基金 - 駿利美國研究基金 B $acc","0P00000JX7":"駿利資產管理基金 - 駿利美國研究基金 I $acc","0P0000ACDV":"駿利資產管理基金 - 駿利美國研究基金 I €acc","0P00000RMV":"駿利資產管理基金 - 駿利美國20基金 A $acc","0P0000ZP59":"駿利資產管理基金 - 駿利美國20基金 A AUDacc","0P00000IRO":"駿利資產管理基金 - 駿利美國20基金 A €acc","0P00000IRQ":"駿利資產管理基金 - 駿利美國20基金 B $acc","0P00000IRU":"駿利資產管理基金 - 駿利美國20基金 I $acc","0P00000G5H":"駿利資產管理基金 - 駿利美國20基金 I €acc","0P00000RMX":"駿利資產管理基金 - 駿利美國創業基金 A $acc","0P0000ZP5A":"駿利資產管理基金 - 駿利美國創業基金 A AUDacc","0P00000IUI":"駿利資產管理基金 - 駿利美國創業基金 A €acc","0P00000IUK":"駿利資產管理基金 - 駿利美國創業基金 B $acc","0P00000IUO":"駿利資產管理基金 - 駿利美國創業基金 I $acc","0P0000AD2M":"駿利資產管理基金 - 駿利美國創業基金 I €acc","0P00000EBB":"駿利資產管理基金 - 駿利美國短期債券基金 A $acc","0P00000RMU":"駿利資產管理基金 - 駿利美國短期債券基金 A $inc","0P0000ZNDB":"駿利資產管理基金 - 駿利美國短期債券基金 A AUDinc","0P00000EBC":"駿利資產管理基金 - 駿利美國短期債券基金 A €acc","0P00000IUD":"駿利資產管理基金 - 駿利美國短期債券基金 B $acc","0P00000IUB":"駿利資產管理基金 - 駿利美國短期債券基金 B $inc","0P0000WDI2":"駿利資產管理基金 - 駿利美國短期債券基金 I $acc","0P00000IUH":"駿利資產管理基金 - 駿利美國短期債券基金 I $inc","0P0000ACEW":"駿利資產管理基金 - 駿利美國短期債券基金 I €acc","0P0000Q5YC":"駿利資產管理基金 - 駿利美國基金 A $acc","0P0000Q5YB":"駿利資產管理基金 - 駿利美國基金 A €acc","0P0000Q5YE":"駿利資產管理基金 - 駿利美國基金 B $acc","0P0000Q5YD":"駿利資產管理基金 - 駿利美國基金 I $acc","0P0000Q5YF":"駿利資產管理基金 - 駿利美國基金 I €acc","0P00005XL9":"駿利資產管理基金 - 駿利環球研究基金 A $acc","0P00005XRU":"駿利資產管理基金 - 駿利環球研究基金 A €acc","0P00005XRY":"駿利資產管理基金 - 駿利環球研究基金 I $acc","0P00005XRX":"駿利資產管理基金 - 駿利環球研究基金 I €acc","0P00000RPL":"駿利資產管理基金 - 駿利環球生命科技基金 A $acc","0P0000ZP57":"駿利資產管理基金 - 駿利環球生命科技基金 A AUDacc","0P00000ITG":"駿利資產管理基金 - 駿利環球生命科技基金 A €acc","0P00000RMR":"駿利資產管理基金 - 駿利環球生命科技基金 B $acc","0P00000ITE":"駿利資產管理基金 - 駿利環球生命科技基金 I $acc","0P0000ACEF":"駿利資產管理基金 - 駿利環球生命科技基金 I €acc","0P00000HSG":"駿利資產管理基金 - 駿利環球房地產基金 A $acc","0P00000HSE":"駿利資產管理基金 - 駿利環球房地產基金 A $inc","0P0000ZP58":"駿利資產管理基金 - 駿利環球房地產基金 A AUDinc","0P00000XMG":"駿利資產管理基金 - 駿利環球房地產基金 A €acc","0P00000HSK":"駿利資產管理基金 - 駿利環球房地產基金 B $acc","0P00000HSI":"駿利資產管理基金 - 駿利環球房地產基金 B $inc","0P00000HSM":"駿利資產管理基金 - 駿利環球房地產基金 I $inc","0P0000ACEV":"駿利資產管理基金 - 駿利環球房地產基金 I €acc","0P0000RQOY":"駿利資產管理基金 - 駿利環球投資等級債券基金 A $acc","0P0000RQP0":"駿利資產管理基金 - 駿利環球投資等級債券基金 A $inc","0P0000RQOZ":"駿利資產管理基金 - 駿利環球投資等級債券基金 A €acc","0P0000RQP1":"駿利資產管理基金 - 駿利環球投資等級債券基金 A €inc","0P0000RQP5":"駿利資產管理基金 - 駿利環球投資等級債券基金 I $acc","0P0000RQP7":"駿利資產管理基金 - 駿利環球投資等級債券基金 I $inc","0P0000RQP6":"駿利資產管理基金 - 駿利環球投資等級債券基金 I €acc","0P0000RQP8":"駿利資產管理基金 - 駿利環球投資等級債券基金 I €inc","0P00000RPM":"駿利資產管理基金 - 駿利環球科技基金 A $acc","0P000135CX":"駿利資產管理基金 - 駿利環球科技基金 A AUD","0P000135CY":"駿利資產管理基金 - 駿利環球科技基金 A HKD","0P00000ITI":"駿利資產管理基金 - 駿利環球科技基金 A €acc","0P00000RMS":"駿利資產管理基金 - 駿利環球科技基金 B $acc","0P00000ITM":"駿利資產管理基金 - 駿利環球科技基金 I $acc","0P0000ACEH":"駿利資產管理基金 - 駿利環球科技基金 I €acc","0P0000RQP9":"駿利資產管理基金 - 駿利環球高收益基金 A $acc","0P0000RQPB":"駿利資產管理基金 - 駿利環球高收益基金 A $inc","0P0000UR82":"駿利資產管理基金 - 駿利環球高收益基金 A AUDinc","0P0000RQPA":"駿利資產管理基金 - 駿利環球高收益基金 A €acc","0P0000RQPD":"駿利資產管理基金 - 駿利環球高收益基金 A €inc","0P0000RQPH":"駿利資產管理基金 - 駿利環球高收益基金 I $acc","0P0000RQPJ":"駿利資產管理基金 - 駿利環球高收益基金 I $inc","0P0000UR83":"駿利資產管理基金 - 駿利環球高收益基金 I AUDinc","0P0000RQPG":"駿利資產管理基金 - 駿利環球高收益基金 I €acc","0P0000RQPI":"駿利資產管理基金 - 駿利環球高收益基金 I €inc","0P00000ITO":"駿利資產管理基金 - 駿利高收益基金 A $acc","0P00000RMT":"駿利資產管理基金 - 駿利高收益基金 A $inc","0P0000ZNDA":"駿利資產管理基金 - 駿利高收益基金 A AUDacc","0P0000UR84":"駿利資產管理基金 - 駿利高收益基金 A AUDinc","0P0000UAJ8":"駿利資產管理基金 - 駿利高收益基金 A HK$acc","0P0000UAJ9":"駿利資產管理基金 - 駿利高收益基金 A HK$inc","0P00000ITQ":"駿利資產管理基金 - 駿利高收益基金 A €acc","0P00000ITU":"駿利資產管理基金 - 駿利高收益基金 B $acc","0P00000ITS":"駿利資產管理基金 - 駿利高收益基金 B $inc","0P00000IU0":"駿利資產管理基金 - 駿利高收益基金 B €inc","0P0000N64Q":"駿利資產管理基金 - 駿利高收益基金 I $acc","0P00000ITY":"駿利資產管理基金 - 駿利高收益基金 I $inc","0P0000UR85":"駿利資產管理基金 - 駿利高收益基金 I AUDinc","0P00000G5D":"駿利資產管理基金 - 駿利高收益基金 I €acc"}
var fundRaning = [{"symbol": "0P0000IVNS", "fund_name": "駿利歐洲基金A €acc", "type": 0, "return": -0.0102, "volatility": 0.1729, "sharpe_ratio": -0.71, "alpha": -14.89, "beta": 1.1, "star": 1, "score_gbr": 2.00216913714, "score_lr": 11.1245309012 }, {"symbol": "0P00000CQF", "fund_name": "駿利資產管理基金 - 柏智美國策略價值基金 A $acc", "type": 1, "return": 0.0062, "volatility": 0.1011, "sharpe_ratio": 0.73, "alpha": -2.94, "beta": 0.89, "star": 3, "score_gbr": 53.9319535344, "score_lr": 74.1685343359 }, {"symbol": "0P00000CQJ", "fund_name": "駿利資產管理基金 - 柏智美國策略價值基金 B $acc", "type": 1, "return": 0.0053, "volatility": 0.1009, "sharpe_ratio": 0.62, "alpha": -4.03, "beta": 0.89, "star": 3, "score_gbr": 45.7278910546, "score_lr": 69.9286077599 }, {"symbol": "0P00000CQP", "fund_name": "駿利資產管理基金 - 柏智美國策略價值基金 I $acc", "type": 1, "return": 0.0069, "volatility": 0.1013, "sharpe_ratio": 0.8, "alpha": -2.21, "beta": 0.89, "star": 3, "score_gbr": 53.3719846754, "score_lr": 77.1321083593 }, {"symbol": "0P0000Q5Y6", "fund_name": "駿利資產管理基金 - 柏智環球價值基金 A $acc", "type": 2, "return": 0.0034, "volatility": 0.0893, "sharpe_ratio": 0.45, "alpha": -0.66, "beta": 0.75, "star": 3, "score_gbr": 43.0651774644, "score_lr": 62.4749894264 }, {"symbol": "0P0000Q5YA", "fund_name": "駿利資產管理基金 - 柏智環球價值基金 I $acc", "type": 2, "return": 0.0043, "volatility": 0.0893, "sharpe_ratio": 0.57, "alpha": 0.42, "beta": 0.75, "star": 4, "score_gbr": 58.8736415871, "score_lr": 66.8820253287 }, {"symbol": "0P00000GB6", "fund_name": "駿利資產管理基金 - 英達美國重點基金 A $acc", "type": 3, "return": 0.009, "volatility": 0.1044, "sharpe_ratio": 1.03, "alpha": -0.06, "beta": 0.91, "star": 3, "score_gbr": 66.7234607414, "score_lr": 86.7488838216 }, {"symbol": "0P00000GEJ", "fund_name": "駿利資產管理基金 - 英達美國重點基金 B $acc", "type": 3, "return": 0.0082, "volatility": 0.1043, "sharpe_ratio": 0.93, "alpha": -1.07, "beta": 0.91, "star": 3, "score_gbr": 48.3320016711, "score_lr": 82.9059687646 }, {"symbol": "0P00000GG3", "fund_name": "駿利資產管理基金 - 英達美國重點基金 I $acc", "type": 3, "return": 0.0095, "volatility": 0.1043, "sharpe_ratio": 1.08, "alpha": 0.51, "beta": 0.91, "star": 4, "score_gbr": 73.3655218051, "score_lr": 88.9291359874 }, {"symbol": "0P0000YE5H", "fund_name": "駿利資產管理基金 - 英達環球股息基金 A $acc", "type": 4, "return": 0.0028, "volatility": 0.1058, "sharpe_ratio": 0.31, "alpha": -3.07, "beta": 0.96, "star": 2, "score_gbr": 45.3985854005, "score_lr": 63.0832105408 }, {"symbol": "0P0000YE5I", "fund_name": "駿利資產管理基金 - 英達環球股息基金 A $inc", "type": 4, "return": 0.0027, "volatility": 0.1058, "sharpe_ratio": 0.3, "alpha": -3.17, "beta": 0.96, "star": 2, "score_gbr": 36.0508518266, "score_lr": 62.6600875488 }, {"symbol": "0P00000IKC", "fund_name": "駿利資產管理基金 - 駿利靈活入息基金 A $acc", "type": 5, "return": 0.0022, "volatility": 0.0247, "sharpe_ratio": 1.03, "alpha": -1.26, "beta": 0.9, "star": 3, "score_gbr": 39.7727363826, "score_lr": 80.8934770196 }, {"symbol": "0P00000RMQ", "fund_name": "駿利資產管理基金 - 駿利靈活入息基金 A $inc", "type": 5, "return": 0.0022, "volatility": 0.0249, "sharpe_ratio": 1.03, "alpha": -1.28, "beta": 0.91, "star": 3, "score_gbr": 36.3060101993, "score_lr": 81.2154539954 }, {"symbol": "0P0000YE5V", "fund_name": "駿利資產管理基金 - 駿利靈活入息基金 A HK$inc", "type": 5, "return": 0.0021, "volatility": 0.0249, "sharpe_ratio": 0.97, "alpha": -1.42, "beta": 0.91, "star": 2, "score_gbr": 34.785461837, "score_lr": 79.9944498555 }, {"symbol": "0P00000IKM", "fund_name": "駿利資產管理基金 - 駿利靈活入息基金 B $acc", "type": 5, "return": 0.0014, "volatility": 0.0245, "sharpe_ratio": 0.64, "alpha": -2.22, "beta": 0.89, "star": 3, "score_gbr": 49.7340891116, "score_lr": 72.2920479873 }, {"symbol": "0P00000IKF", "fund_name": "駿利資產管理基金 - 駿利靈活入息基金 B $inc", "type": 5, "return": 0.0014, "volatility": 0.0247, "sharpe_ratio": 0.62, "alpha": -2.26, "beta": 0.9, "star": 3, "score_gbr": 49.7340891116, "score_lr": 72.2917904453 }, {"symbol": "0P0000W8BF", "fund_name": "駿利資產管理基金 - 駿利靈活入息基金 I $acc", "type": 5, "return": 0.0032, "volatility": 0.0246, "sharpe_ratio": 1.52, "alpha": -0.04, "beta": 0.9, "star": 4, "score_gbr": 94.143949434, "score_lr": 91.2879937254 }, {"symbol": "0P00000IKT", "fund_name": "駿利資產管理基金 - 駿利靈活入息基金 I $inc", "type": 5, "return": 0.0032, "volatility": 0.0246, "sharpe_ratio": 1.54, "alpha": -0.02, "beta": 0.9, "star": 5, "score_gbr": 94.143949434, "score_lr": 91.6102282431 }, {"symbol": "0P00000IR4", "fund_name": "駿利資產管理基金 - 駿利策略Alpha基金 A $acc", "type": 1, "return": 0.0067, "volatility": 0.1371, "sharpe_ratio": 0.58, "alpha": -3.08, "beta": 0.95, "star": 2, "score_gbr": 49.9052584921, "score_lr": 71.023090578 }, {"symbol": "0P00000IR6", "fund_name": "駿利資產管理基金 - 駿利策略Alpha基金 B $acc", "type": 1, "return": 0.0059, "volatility": 0.1374, "sharpe_ratio": 0.51, "alpha": -4.15, "beta": 0.96, "star": 2, "score_gbr": 33.4824802956, "score_lr": 67.9101658875 }, {"symbol": "0P00000IRA", "fund_name": "駿利資產管理基金 - 駿利策略Alpha基金 I $acc", "type": 1, "return": 0.0077, "volatility": 0.1376, "sharpe_ratio": 0.66, "alpha": -1.96, "beta": 0.95, "star": 2, "score_gbr": 47.67525247, "score_lr": 74.9864521305 }, {"symbol": "0P00000RMP", "fund_name": "駿利資產管理基金 - 駿利平衡基金 A $acc", "type": 6, "return": 0.0035, "volatility": 0.0645, "sharpe_ratio": 0.64, "alpha": -2.11, "beta": 1.04, "star": 5, "score_gbr": 81.4873738323, "score_lr": 77.524024669 }, {"symbol": "0P0000UAJA", "fund_name": "駿利資產管理基金 - 駿利平衡基金 A HK$acc", "type": 6, "return": 0.0035, "volatility": 0.0645, "sharpe_ratio": 0.64, "alpha": -2.09, "beta": 1.04, "star": 4, "score_gbr": 81.1873796531, "score_lr": 77.5394349619 }, {"symbol": "0P00000IQE", "fund_name": "駿利資產管理基金 - 駿利平衡基金 A €acc", "type": 7, "return": -0.0013, "volatility": 0.1157, "sharpe_ratio": -0.15, "alpha": -7.4, "beta": 1.33, "star": 3, "score_gbr": 53.9024271364, "score_lr": 57.0066883729 }, {"symbol": "0P00000IS9", "fund_name": "駿利資產管理基金 - 駿利平衡基金 B $acc", "type": 6, "return": 0.0027, "volatility": 0.0644, "sharpe_ratio": 0.48, "alpha": -3.11, "beta": 1.04, "star": 5, "score_gbr": 87.8606315951, "score_lr": 72.7683420842 }, {"symbol": "0P00000ISG", "fund_name": "駿利資產管理基金 - 駿利平衡基金 I $acc", "type": 6, "return": 0.0043, "volatility": 0.0643, "sharpe_ratio": 0.79, "alpha": -1.15, "beta": 1.03, "star": 5, "score_gbr": 69.7542032325, "score_lr": 81.768788467 }, {"symbol": "0P0000ZND3", "fund_name": "駿利資產管理基金 - 駿利平衡基金 I $inc", "type": 6, "return": 0.0066, "volatility": 0.0578, "sharpe_ratio": 1.36, "alpha": 2.2, "beta": 0.95, "star": 0, "score_gbr": 88.6792660436, "score_lr": 95.3509291652 }, {"symbol": "0P0000ACDS", "fund_name": "駿利資產管理基金 - 駿利平衡基金 I €acc", "type": 7, "return": -0.0005, "volatility": 0.1156, "sharpe_ratio": -0.06, "alpha": -6.4, "beta": 1.32, "star": 4, "score_gbr": 64.8106946964, "score_lr": 60.3510989024 }, {"symbol": "0P00000JWZ", "fund_name": "駿利資產管理基金 - 駿利美國研究基金 A $acc", "type": 8, "return": 0.0071, "volatility": 0.122, "sharpe_ratio": 0.69, "alpha": -5.08, "beta": 1.02, "star": 2, "score_gbr": 40.8202963844, "score_lr": 76.0676377907 }, {"symbol": "0P00000JX5", "fund_name": "駿利資產管理基金 - 駿利美國研究基金 B $acc", "type": 8, "return": 0.0062, "volatility": 0.122, "sharpe_ratio": 0.6, "alpha": -6.14, "beta": 1.03, "star": 2, "score_gbr": 40.8202963844, "score_lr": 72.4950381476 }, {"symbol": "0P00000JX7", "fund_name": "駿利資產管理基金 - 駿利美國研究基金 I $acc", "type": 8, "return": 0.0082, "volatility": 0.122, "sharpe_ratio": 0.8, "alpha": -3.66, "beta": 1.02, "star": 3, "score_gbr": 50.7452756828, "score_lr": 80.9685553906 }, {"symbol": "0P00000RMV", "fund_name": "駿利資產管理基金 - 駿利美國20基金 A $acc", "type": 8, "return": 0.0084, "volatility": 0.1398, "sharpe_ratio": 0.72, "alpha": -5.05, "beta": 1.15, "star": 3, "score_gbr": 53.6961508395, "score_lr": 81.8150170639 }, {"symbol": "0P00000IRQ", "fund_name": "駿利資產管理基金 - 駿利美國20基金 B $acc", "type": 8, "return": 0.0076, "volatility": 0.1396, "sharpe_ratio": 0.64, "alpha": -6.05, "beta": 1.15, "star": 3, "score_gbr": 51.4696904178, "score_lr": 78.2973325583 }, {"symbol": "0P00000IRU", "fund_name": "駿利資產管理基金 - 駿利美國20基金 I $acc", "type": 8, "return": 0.0093, "volatility": 0.1398, "sharpe_ratio": 0.79, "alpha": -4, "beta": 1.15, "star": 4, "score_gbr": 72.4405660049, "score_lr": 85.4318769649 }, {"symbol": "0P00000RMX", "fund_name": "駿利資產管理基金 - 駿利美國創業基金 A $acc", "type": 9, "return": 0.0087, "volatility": 0.1548, "sharpe_ratio": 0.67, "alpha": 1.08, "beta": 1, "star": 4, "score_gbr": 74.09215663, "score_lr": 79.3621680735 }, {"symbol": "0P00000IUK", "fund_name": "駿利資產管理基金 - 駿利美國創業基金 B $acc", "type": 9, "return": 0.0078, "volatility": 0.1548, "sharpe_ratio": 0.6, "alpha": 0.07, "beta": 1, "star": 4, "score_gbr": 74.09215663, "score_lr": 75.7761287585 }, {"symbol": "0P00000IUO", "fund_name": "駿利資產管理基金 - 駿利美國創業基金 I $acc", "type": 9, "return": 0.0094, "volatility": 0.1551, "sharpe_ratio": 0.72, "alpha": 1.89, "beta": 1, "star": 5, "score_gbr": 94.1338157596, "score_lr": 82.0698578639 }, {"symbol": "0P00000EBB", "fund_name": "駿利資產管理基金 - 駿利美國短期債券基金 A $acc", "type": 10, "return": 0.0005, "volatility": 0.0087, "sharpe_ratio": 0.61, "alpha": -0.55, "beta": 1, "star": 3, "score_gbr": 55.6332970149, "score_lr": 77.0221087696 }, {"symbol": "0P00000RMU", "fund_name": "駿利資產管理基金 - 駿利美國短期債券基金 A $inc", "type": 10, "return": 0.0005, "volatility": 0.0085, "sharpe_ratio": 0.63, "alpha": -0.49, "beta": 0.95, "star": 3, "score_gbr": 60.8256049227, "score_lr": 75.6026180881 }, {"symbol": "0P00000IUD", "fund_name": "駿利資產管理基金 - 駿利美國短期債券基金 B $acc", "type": 10, "return": -0.0002, "volatility": 0.0083, "sharpe_ratio": -0.36, "alpha": -1.31, "beta": 0.93, "star": 3, "score_gbr": 47.0194910305, "score_lr": 57.73820415 }, {"symbol": "0P00000IUB", "fund_name": "駿利資產管理基金 - 駿利美國短期債券基金 B $inc", "type": 10, "return": -0.0002, "volatility": 0.0083, "sharpe_ratio": -0.36, "alpha": -1.29, "beta": 0.92, "star": 3, "score_gbr": 47.0194910305, "score_lr": 57.3948248139 }, {"symbol": "0P0000WDI2", "fund_name": "駿利資產管理基金 - 駿利美國短期債券基金 I $acc", "type": 10, "return": 0.0009, "volatility": 0.0079, "sharpe_ratio": 1.24, "alpha": 0.03, "beta": 0.87, "star": 4, "score_gbr": 72.9806211914, "score_lr": 83.3259522677 }, {"symbol": "0P00000IUH", "fund_name": "駿利資產管理基金 - 駿利美國短期債券基金 I $inc", "type": 10, "return": 0.0009, "volatility": 0.0085, "sharpe_ratio": 1.15, "alpha": -0.05, "beta": 0.94, "star": 4, "score_gbr": 72.9806211914, "score_lr": 84.330922407 }, {"symbol": "0P0000Q5YC", "fund_name": "駿利資產管理基金 - 駿利美國基金 A $acc", "type": 8, "return": 0.0083, "volatility": 0.1174, "sharpe_ratio": 0.84, "alpha": -3.16, "beta": 0.99, "star": 3, "score_gbr": 52.682793338, "score_lr": 81.5760059807 }, {"symbol": "0P0000Q5YE", "fund_name": "駿利資產管理基金 - 駿利美國基金 B $acc", "type": 8, "return": 0.0074, "volatility": 0.1174, "sharpe_ratio": 0.75, "alpha": -4.18, "beta": 0.99, "star": 3, "score_gbr": 44.2520062551, "score_lr": 77.6754372945 }, {"symbol": "0P0000Q5YD", "fund_name": "駿利資產管理基金 - 駿利美國基金 I $acc", "type": 8, "return": 0.0092, "volatility": 0.1177, "sharpe_ratio": 0.93, "alpha": -2.14, "beta": 0.99, "star": 3, "score_gbr": 56.5465775334, "score_lr": 85.4444711264 }, {"symbol": "0P00005XL9", "fund_name": "駿利資產管理基金 - 駿利環球研究基金 A $acc", "type": 11, "return": 0.0046, "volatility": 0.1224, "sharpe_ratio": 0.44, "alpha": -3.95, "beta": 1.02, "star": 3, "score_gbr": 48.2858943412, "score_lr": 68.2437264411 }, {"symbol": "0P00005XRY", "fund_name": "駿利資產管理基金 - 駿利環球研究基金 I $acc", "type": 11, "return": 0.0056, "volatility": 0.1231, "sharpe_ratio": 0.54, "alpha": -2.72, "beta": 1.02, "star": 4, "score_gbr": 65.0360444807, "score_lr": 72.5772664693 }, {"symbol": "0P00000RPL", "fund_name": "駿利資產管理基金 - 駿利環球生命科技基金 A $acc", "type": 12, "return": 0.0129, "volatility": 0.1736, "sharpe_ratio": 0.89, "alpha": 0.42, "beta": 1.26, "star": 5, "score_gbr": 100, "score_lr": 97.6370987823 }, {"symbol": "0P00000RMR", "fund_name": "駿利資產管理基金 - 駿利環球生命科技基金 B $acc", "type": 12, "return": 0.0121, "volatility": 0.1734, "sharpe_ratio": 0.83, "alpha": -0.55, "beta": 1.26, "star": 4, "score_gbr": 81.1654757563, "score_lr": 94.4493539408 }, {"symbol": "0P00000ITE", "fund_name": "駿利資產管理基金 - 駿利環球生命科技基金 I $acc", "type": 12, "return": 0.0135, "volatility": 0.1736, "sharpe_ratio": 0.93, "alpha": 1.19, "beta": 1.26, "star": 5, "score_gbr": 100, "score_lr": 100 }, {"symbol": "0P00000HSG", "fund_name": "駿利資產管理基金 - 駿利環球房地產基金 A $acc", "type": 13, "return": 0.0069, "volatility": 0.1189, "sharpe_ratio": 0.69, "alpha": -0.96, "beta": 0.89, "star": 3, "score_gbr": 51.9736310432, "score_lr": 74.5243107188 }, {"symbol": "0P00000HSE", "fund_name": "駿利資產管理基金 - 駿利環球房地產基金 A $inc", "type": 13, "return": 0.0069, "volatility": 0.1193, "sharpe_ratio": 0.69, "alpha": -0.97, "beta": 0.89, "star": 3, "score_gbr": 51.9736310432, "score_lr": 74.4738008515 }, {"symbol": "0P00000HSK", "fund_name": "駿利資產管理基金 - 駿利環球房地產基金 B $acc", "type": 13, "return": 0.0061, "volatility": 0.1189, "sharpe_ratio": 0.61, "alpha": -1.94, "beta": 0.89, "star": 3, "score_gbr": 51.9736310432, "score_lr": 71.0006341457 }, {"symbol": "0P00000HSI", "fund_name": "駿利資產管理基金 - 駿利環球房地產基金 B $inc", "type": 13, "return": 0.0061, "volatility": 0.119, "sharpe_ratio": 0.6, "alpha": -2, "beta": 0.89, "star": 3, "score_gbr": 51.9736310432, "score_lr": 70.7902899743 }, {"symbol": "0P00000HSM", "fund_name": "駿利資產管理基金 - 駿利環球房地產基金 I $inc", "type": 13, "return": 0.0078, "volatility": 0.1191, "sharpe_ratio": 0.78, "alpha": 0.07, "beta": 0.89, "star": 4, "score_gbr": 69.8372904715, "score_lr": 78.4111821911 }, {"symbol": "0P0000RQOY", "fund_name": "駿利資產管理基金 - 駿利環球投資等級債券基金 A $acc", "type": 14, "return": 0.0018, "volatility": 0.041, "sharpe_ratio": 0.5, "alpha": -1.66, "beta": 1.01, "star": 3, "score_gbr": 52.9699599887, "score_lr": 73.8861850933 }, {"symbol": "0P0000RQP0", "fund_name": "駿利資產管理基金 - 駿利環球投資等級債券基金 A $inc", "type": 14, "return": 0.0018, "volatility": 0.041, "sharpe_ratio": 0.51, "alpha": -1.66, "beta": 1.02, "star": 3, "score_gbr": 52.9699599887, "score_lr": 74.3983868348 }, {"symbol": "0P0000RQOZ", "fund_name": "駿利資產管理基金 - 駿利環球投資等級債券基金 A €acc", "type": 15, "return": -0.0032, "volatility": 0.1126, "sharpe_ratio": -0.35, "alpha": -3.81, "beta": 1.29, "star": 1, "score_gbr": 2.6205448664, "score_lr": 51.9406428991 }, {"symbol": "0P0000RQP1", "fund_name": "駿利資產管理基金 - 駿利環球投資等級債券基金 A €inc", "type": 15, "return": -0.0031, "volatility": 0.1127, "sharpe_ratio": -0.34, "alpha": -3.75, "beta": 1.3, "star": 1, "score_gbr": 2.6205448664, "score_lr": 52.6810337542 }, {"symbol": "0P0000RQP5", "fund_name": "駿利資產管理基金 - 駿利環球投資等級債券基金 I $acc", "type": 14, "return": 0.0028, "volatility": 0.041, "sharpe_ratio": 0.79, "alpha": -0.5, "beta": 1.02, "star": 4, "score_gbr": 73.7586145564, "score_lr": 81.5143171217 }, {"symbol": "0P0000RQP7", "fund_name": "駿利資產管理基金 - 駿利環球投資等級債券基金 I $inc", "type": 14, "return": 0.0028, "volatility": 0.0409, "sharpe_ratio": 0.79, "alpha": -0.48, "beta": 1.02, "star": 4, "score_gbr": 73.7586145564, "score_lr": 81.5404285948 }, {"symbol": "0P0000RQP6", "fund_name": "駿利資產管理基金 - 駿利環球投資等級債券基金 I €acc", "type": 15, "return": -0.0038, "volatility": 0.1231, "sharpe_ratio": -0.38, "alpha": -4.56, "beta": 1.35, "star": 1, "score_gbr": 3.29966904682, "score_lr": 50.7756779407 }, {"symbol": "0P0000RQP8", "fund_name": "駿利資產管理基金 - 駿利環球投資等級債券基金 I €inc", "type": 15, "return": -0.0023, "volatility": 0.1132, "sharpe_ratio": -0.25, "alpha": -2.72, "beta": 1.3, "star": 1, "score_gbr": 7.9106835699, "score_lr": 56.343142271 }, {"symbol": "0P00000RPM", "fund_name": "駿利資產管理基金 - 駿利環球科技基金 A $acc", "type": 16, "return": 0.0103, "volatility": 0.1502, "sharpe_ratio": 0.82, "alpha": -3.09, "beta": 1.01, "star": 4, "score_gbr": 76.3098202424, "score_lr": 82.3838982327 }, {"symbol": "0P00000RMS", "fund_name": "駿利資產管理基金 - 駿利環球科技基金 B $acc", "type": 16, "return": 0.0095, "volatility": 0.1501, "sharpe_ratio": 0.76, "alpha": -4.02, "beta": 1, "star": 4, "score_gbr": 63.2907714718, "score_lr": 78.8574831679 }, {"symbol": "0P00000ITM", "fund_name": "駿利資產管理基金 - 駿利環球科技基金 I $acc", "type": 16, "return": 0.0111, "volatility": 0.1504, "sharpe_ratio": 0.88, "alpha": -2.24, "beta": 1.01, "star": 5, "score_gbr": 87.021071023, "score_lr": 85.4791813164 }, {"symbol": "0P0000RQP9", "fund_name": "駿利資產管理基金 - 駿利環球高收益基金 A $acc", "type": 17, "return": 0.0025, "volatility": 0.0541, "sharpe_ratio": 0.53, "alpha": -0.89, "beta": 0.79, "star": 3, "score_gbr": 43.2560742073, "score_lr": 66.9931071678 }, {"symbol": "0P0000RQPB", "fund_name": "駿利資產管理基金 - 駿利環球高收益基金 A $inc", "type": 17, "return": 0.0025, "volatility": 0.0546, "sharpe_ratio": 0.52, "alpha": -0.93, "beta": 0.8, "star": 3, "score_gbr": 47.6433717304, "score_lr": 67.1141581976 }, {"symbol": "0P0000RQPA", "fund_name": "駿利資產管理基金 - 駿利環球高收益基金 A €acc", "type": 18, "return": -0.0023, "volatility": 0.1209, "sharpe_ratio": -0.24, "alpha": -3.18, "beta": 1.03, "star": 1, "score_gbr": 0, "score_lr": 45.6308067847 }, {"symbol": "0P0000RQPD", "fund_name": "駿利資產管理基金 - 駿利環球高收益基金 A €inc", "type": 18, "return": -0.0024, "volatility": 0.1212, "sharpe_ratio": -0.24, "alpha": -3.21, "beta": 1.04, "star": 1, "score_gbr": 1.27743632971, "score_lr": 45.7417180189 }, {"symbol": "0P0000RQPH", "fund_name": "駿利資產管理基金 - 駿利環球高收益基金 I $acc", "type": 17, "return": 0.0032, "volatility": 0.0541, "sharpe_ratio": 0.7, "alpha": 0.05, "beta": 0.79, "star": 3, "score_gbr": 58.7561029241, "score_lr": 71.6740127514 }, {"symbol": "0P0000RQPJ", "fund_name": "駿利資產管理基金 - 駿利環球高收益基金 I $inc", "type": 17, "return": 0.0032, "volatility": 0.0543, "sharpe_ratio": 0.7, "alpha": 0.03, "beta": 0.8, "star": 3, "score_gbr": 63.1434004472, "score_lr": 71.9959897272 }, {"symbol": "0P0000RQPG", "fund_name": "駿利資產管理基金 - 駿利環球高收益基金 I €acc", "type": 18, "return": -0.0221, "volatility": 0.4575, "sharpe_ratio": -0.58, "alpha": -19.91, "beta": 2.33, "star": 0, "score_gbr": 2.18480370176, "score_lr": 0 }, {"symbol": "0P0000RQPI", "fund_name": "駿利資產管理基金 - 駿利環球高收益基金 I €inc", "type": 18, "return": -0.0002, "volatility": 0.1254, "sharpe_ratio": -0.03, "alpha": -0.65, "beta": 1.05, "star": 3, "score_gbr": 49.3922464785, "score_lr": 55.0837370658 }, {"symbol": "0P00000ITO", "fund_name": "駿利資產管理基金 - 駿利高收益基金 A $acc", "type": 19, "return": 0.0029, "volatility": 0.05, "sharpe_ratio": 0.67, "alpha": -0.82, "beta": 0.78, "star": 3, "score_gbr": 46.5805164038, "score_lr": 70.0454091848 }, {"symbol": "0P00000RMT", "fund_name": "駿利資產管理基金 - 駿利高收益基金 A $inc", "type": 19, "return": 0.0029, "volatility": 0.0499, "sharpe_ratio": 0.67, "alpha": -0.81, "beta": 0.77, "star": 3, "score_gbr": 46.5805164038, "score_lr": 69.7050258824 }, {"symbol": "0P0000UAJ8", "fund_name": "駿利資產管理基金 - 駿利高收益基金 A HK$acc", "type": 19, "return": 0.0029, "volatility": 0.0503, "sharpe_ratio": 0.66, "alpha": -0.85, "beta": 0.78, "star": 2, "score_gbr": 40.7025794422, "score_lr": 69.8367780924 }, {"symbol": "0P0000UAJ9", "fund_name": "駿利資產管理基金 - 駿利高收益基金 A HK$inc", "type": 19, "return": 0.0029, "volatility": 0.0503, "sharpe_ratio": 0.67, "alpha": -0.82, "beta": 0.78, "star": 2, "score_gbr": 40.7025794422, "score_lr": 70.0133056442 }, {"symbol": "0P00000ITU", "fund_name": "駿利資產管理基金 - 駿利高收益基金 B $acc", "type": 19, "return": 0.002, "volatility": 0.05, "sharpe_ratio": 0.47, "alpha": -1.82, "beta": 0.78, "star": 2, "score_gbr": 30.0437683932, "score_lr": 64.4727175555 }, {"symbol": "0P00000ITS", "fund_name": "駿利資產管理基金 - 駿利高收益基金 B $inc", "type": 19, "return": 0.002, "volatility": 0.0497, "sharpe_ratio": 0.47, "alpha": -1.79, "beta": 0.77, "star": 2, "score_gbr": 30.0437683932, "score_lr": 64.1691469064 }, {"symbol": "0P0000N64Q", "fund_name": "駿利資產管理基金 - 駿利高收益基金 I $acc", "type": 19, "return": 0.0038, "volatility": 0.05, "sharpe_ratio": 0.89, "alpha": 0.29, "beta": 0.78, "star": 4, "score_gbr": 73.7280793932, "score_lr": 76.0096816502 }, {"symbol": "0P00000ITY", "fund_name": "駿利資產管理基金 - 駿利高收益基金 I $inc", "type": 19, "return": 0.0038, "volatility": 0.0498, "sharpe_ratio": 0.9, "alpha": 0.31, "beta": 0.78, "star": 4, "score_gbr": 73.7280793932, "score_lr": 76.1999064159 } ]






module.exports = router;
