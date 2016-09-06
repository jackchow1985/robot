var redis = require("redis"),
    client = redis.createClient({host:"redis-server"});
var mysql = require('mysql');
var request = require('request');
var mongo = require('mongoskin');
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
function dailyUpdate() {
  //if(new Date().getHours() == 9) { // run update on 7:00 am
    console.info("Daily updating")
    var exec = require('child_process').exec;
    var cmd = 'ls python/*.py|xargs -n 1 -P 1 python';

    exec(cmd, function(error, stdout, stderr) {

      //console.info(stderr||stdout)
    });

    // cmd = 'ls R/cafe_display.R|xargs -n 1 -P 1 Rscript';
    // exec(cmd, function(error, stdout, stderr) {

    //   console.info(stderr||stdout)
    // });
  //}
}

setInterval(function() {
  dailyUpdate();
  updatePrediction();
}, 1000*60*60*3); //1 hour
//dailyUpdate();

function _getStocksHistory(stockArr, resultArr, cb) {
	if(stockArr.length ==0) {
		cb(resultArr)
	}
	else {
		var code = stockArr.pop()
		var stockCode = ""
		if(code && code.stock_id.indexOf("6") ==0) { // shanghai
			stockCode = "sh" + code.stock_id
		} else if(code && code.stock_id.length == 6){
			stockCode = "sz" + code.stock_id
		} else {
			stockCode = code.stock_id
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
			var histArr = data.record.slice(-30)
			resultArr.push({
				rank : code.rank,
				symbol : code.stock_id,
				histArr : histArr
			})
	   		_getStocksHistory(stockArr, resultArr.reverse(), cb)
		})
	}
}
function updatePrediction() {
	predicts = ftawsdb.collection("allsc")
	predicts.aggregate([{$group:{ _id: "$DATA_date" , count: { $sum: 1 }} }, {"$sort" : { "_id" : -1, }}] , function(err, items){
		var tradeDate = []
		for(var i in items) {
			if(items[i] && items[i]._id) {
				tradeDate.push(items[i]._id)
			}
		}
		console.info(tradeDate)
		_getPredictionFromMongo(tradeDate, 0)
	});
					  	
	
					
}

function _date2str(x, y) {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
    });

    return y.replace(/(y+)/g, function(v) {
        return x.getFullYear().toString().slice(-v.length)
    });
}

function _getPredictionFromMongo(tradeDates, index) {
	if(index == tradeDates.length )
		return
	
	else {
		//console.info(tradeDates)
		var date = tradeDates[index + 1] // the last trade date
		//console.info(_date2str(dateObj.DATE, "yyyy-MM-dd"))
		if(date) {
			
			var todate = tradeDates[index]
			client.get("predict_" + date, function(rrr, data) {
				if(data) {
					console.info(data)
					index ++;
					_getPredictionFromMongo(tradeDates, index)
				} else {
			
					console.info("predict date: " + date)
					console.info("observe date: " +todate)
					predicts = ftawsdb.collection("allsc")

					predicts.find({"DATA_date" : date},{"_id" : 0 }).sort({"testPred" : -1}).limit(50).toArray(function(err, stocks) {		
						var stockArr = [];
						if(stocks && stocks.length >0) {
							stocks.push({    //push shanghai index
								stock_id :"sh000001",
								rank : 0
							})
							_getStocksHistory(stocks, [], function(result) {
								result.sort(function(a, b) {
						         	return a.rank - b.rank 
						        })
						        var top10Mean = 0, top20Mean = 0, top30Mean = 0, top40Mean = 0;
						        var indexVol = 0;
						        //console.info(result)
						        for(var i in result) {

						        	
						        	var dateArr = result[i].histArr;
						        	var todateObj = [], lastDateObj = []
						        	for(var k in dateArr) {
						        		//console.info(dateArr[k][0])
							        	if(todate == dateArr[k][0]) { //

							        		todateObj = dateArr[k]
							        		//break;
							        	}
							        	if(date == dateArr[k][0]) { //

							        		lastDateObj = dateArr[k]
							        		//break;
							        	}


							        }
							        if(result[i].symbol == "sh000001")  {
							        	indexVol = (parseFloat(todateObj[2]) - parseFloat(todateObj[4]))/parseFloat(lastDateObj[3])* 100
							        	continue;
							        }
							        // console.info(todateObj)
							        // console.info(lastDateObj)
							        var c10 = 0,  c20 = 0, c30 = 0, c40 = 0;
							       	if(i <= 10 && todateObj[2] && todateObj[4] && lastDateObj[3]) {
							       		console.info((parseFloat(todateObj[2]) - parseFloat(todateObj[4]))/parseFloat(lastDateObj[3])* 100)
										top10Mean += (parseFloat(todateObj[2]) - parseFloat(todateObj[4]))/parseFloat(lastDateObj[3])* 100
										c10 ++;
							    	}
							    	if(i <= 20 && todateObj[2] && todateObj[4] && lastDateObj[3]) {
										top20Mean += (parseFloat(todateObj[2]) - parseFloat(todateObj[4]))/parseFloat(lastDateObj[3])* 100;
										c20 ++; 
							    	}
							    	if(i <= 30 && todateObj[2] && todateObj[4] && lastDateObj[3]) {
										top30Mean += (parseFloat(todateObj[2]) - parseFloat(todateObj[4]))/parseFloat(lastDateObj[3])* 100
										c30 ++;
							    	}
							    	if(i <= 40 && todateObj[2] && todateObj[4] && lastDateObj[3]) {
										top40Mean += (parseFloat(todateObj[2]) - parseFloat(todateObj[4]))/parseFloat(lastDateObj[3])* 100
										c40 ++;
							    	}
							    
						        }
						        var meanObj = {
						        	date : date,
						        	indexVol: indexVol,
							        top10Mean : parseFloat(top10Mean/c10),
								    top20Mean : parseFloat(top20Mean/c20),
					    			top30Mean : parseFloat(top30Mean/c30),
					   				top40Mean : parseFloat(top40Mean/c40)
					   			}
					   			client.set("predict_" + date, JSON.stringify(meanObj))
								console.info(JSON.stringify(meanObj))
								
								index ++;
								_getPredictionFromMongo(tradeDates, index)
							})
						} else {
							console.info("missing predict for date: " + date)
							index ++;
							_getPredictionFromMongo(tradeDates, index)
						}

					})
				}
			})

		} else {
			console.info("Done")
			return;
		}
	}
}

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
	if(poolName == "CN") {
		pool = poolAliyun;
	} else if(poolName == "INC" || poolName == "SEED") { 
		pool = poolIDC
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
					try {
						connection.query(query, function(err, rows, fields) {
						  if (err) {
						  	cb(err);
						  } else {
						  	_cacheManagerWrite(query + "##|" + poolName, JSON.stringify(rows))
						  	cb(null, rows)
						  }
						  connection.release();
						});
					} catch(e) {
						cb("no connection")
					}
				} else {
					cb("no connection")
				}
			});
		}
	})

}
function _refresh(queryArr, index) {
	client.set("cache-index", index);
	console.info("current index is " + index)

	_query(queryArr[index].poolName, queryArr[index].query, function() {
		console.info(queryArr[index].query + " ## Cache refreshed ##" + new Date());
		index ++;
		if(index < queryArr.length)
			_refresh(queryArr, index); //do next query
		else {
			console.info("Current round is done !" + new Date())
			client.set("cache-index", 0);
		}
	}, true)
	
}

function _refreshCache () {
	
	client.keys("cache##*", function(err, list) {
		var queryArr = []
		console.info("cache sql loaded")
		for (var i = 0; i < list.length; i++) {
			var q = list[i];
			q = q.replace("cache##", ""); 
			//console.info(q)
			var qs = q.split("##|")
			queryArr.push({
				poolName : qs[1],
				query : qs[0]
			})
		}
		if(list && list.length > 0) {
			client.get("cache-index", function(err, index){
				console.info("redis index is " + index)
				_refresh(queryArr, index || 0);
			})
		}
	});
}

setInterval(function() {
	_refreshCache()

}, 1000 * 60 * 60 * 4) // 4 hours
//_refreshCache()

updatePrediction()
