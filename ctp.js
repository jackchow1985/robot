var mysql = require('mysql');
var poolSHQA = mysql.createPool({
  connectionLimit : 10,
  host     : '192.168.4.71',
  user     : 'tqt001',
  password : 'tqt002',
  multipleStatements : true
});
var contractMutilper = {"A":10,"B":10,"BB":500,"C":10,"CS":10,"FB":500,"I":100,"J":100,"JD":10,"JM":60,"L":5,"M":10,"P":10,"PP":5,"V":5,"Y":10,"AG":15,"AL":5,"AU":1000,"BU":10,"CU":5,"FU":50,"HC":10,"NI":1,"PB":5,"RB":10,"RU":10,"SN":1,"WR":10,"ZN":5,"CF":5,"FG":20,"JR":20,"LR":20,"MA":10,"OI":10,"PM":50,"RI":20,"RM":10,"RS":10,"SF":5,"SM":5,"SR":10,"TA":5,"WH":20,"ZC":100,"IC":200,"IF":300,"IH":300,"TF":10000,"T":10000}
function _erxtracInstrument(instrumentID) {

	return instrumentID.replace(/[0-9]/g, '').toUpperCase();
}


function getCommision() {
	var sql = 'select * from LTS_China.ctp_user_behavior where behavior="OnRspQryTradingAccountForMy" and brokerid ="7090"'
	_query(sql, function(err, result) {
		var totalCommision = 0
		for(var i in result) {
			if(result[i].args) {
				var ctpObj = JSON.parse(result[i].args)
				if(ctpObj.hasOwnProperty("Commission")) {					
					//console.info(ctpObj.AccountID + " : "+ ctpObj.Commission)
					totalCommision +=  ctpObj.Commission
					
				} else {
					console.info("Incomplete daily settlement: " + JSON.stringify(ctpObj))
				}
				
			} else {
				console.info("No args " + result[i])
			}
			
		}
		console.info("###### Total Commission: " + totalCommision)
	})
}

function getTotalTradeRecord() {
	var sql = 'select * from LTS_China.ctp_user_behavior where behavior="OnRtnTrade" and brokerid ="7090"'
	_query(sql, function(err, result) {
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
		
		console.info("###### Total amount: " + totalAmount)
		console.info("###### Total Volume: " + totalVol)
	})
}

function _query(query, cb) {
	poolSHQA.getConnection(function(err, connection) {
		console.info(query)
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

getCommision();
getTotalTradeRecord();