// var tushare = require('tushare');

// var redis = require("redis"),
//     client = redis.createClient({host:"125.227.191.247"});


// // tushare.stock.getTodayAll(function(err, data) {
// //   console.log(data.length);
// // });
// client.subscribe("Forex");
// client.on("message", function (channel, message) {
// 	// var quote = JSON.parse(message) 
// 	// 	if(quote.Code == "600520.SH")
// 			console.log(message);	
	
    
// });


var googleFinance = require('google-finance');
googleFinance.historical({
  symbol: 'HKG:0005',
  from: '2016-01-01',
  to: '2016-12-31'
}, function (err, quotes) {
  console.info(quotes)
});