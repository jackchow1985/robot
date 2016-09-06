'use strict';

angular.module('inspinia')
  .controller('PredictCrol', function ($scope, $rootScope, $http) {
  	$scope.stockHistMap = {}

  	function _getStockHistory(symbol) {
  		var stockCode = ""
		if(symbol && symbol.indexOf("6") ==0) { // shanghai
			stockCode = "sh" + symbol
		} else {
			stockCode = "sz" + symbol
		}
  		$http.get("getStockHistory?symbol=" + stockCode).success(function(data) {
  			var data = data.record
  			$scope.stockHistMap[symbol] = {
  				today : data[data.length -1],
  				last : data[data.length - 2]
  			}
  		})
  	}
  	$http.get("getRealTimeQuotes").success(function(data) {
  		$scope.stockName = {}
  		for(var i in data) {
  			$scope.stockName[data[i].code] = data[i].name
  		}
  	})
  	$http.get("getStockHistory?symbol=sh000001").success(function(data) {
  		var data = data.record
  		var shIndex = data[data.length - 1]
	    var shLastIndex = data[data.length -2]
	    $scope.shIndex = shIndex
  		$scope.shIndexVar = (parseFloat(shIndex[2]) -  parseFloat(shLastIndex[3])) / parseFloat(shLastIndex[3]) * 100
	    
	    $scope.indexVol = (parseFloat(shIndex[2]) - parseFloat(shIndex[4])) / parseFloat(shLastIndex[2]) *100
	    	    
  		var tradeDate = ""
  		if(new Date().getHours() < 15) { // get the last trade date
  			tradeDate = shLastIndex[0]
  		} else { //after 15:00pm // get the day before current trade date
  			tradeDate = shLastIndex[0]
  		}

  		if(new Date().getHours() >= 15) { //after 
  			_getPredictData(shIndex[0]);

  		}
  		$scope.obsDate = shIndex[0]
  		_getTodayData(tradeDate);
  		$http.get("getPredictionHistoryTopByDate?date=predict_" + tradeDate ).success(function(data) { 
  			$scope.volTop = data
  		})
  		$http.get("getPredictionHistoryTop").success(function(data) { 
  			for(var i in data) {
  				getTopData(data[i])
  			}
  		})
  		
  	})

  	function getTopData(date) {
  		$http.get("getPredictionHistoryTopByDate?date=" + date ).success(function(data) { 
  			if(data.top10Mean) {
  				var obsDate = moment(data.date).add(1, 'days').format('YYYY-MM-DD');
  				if(moment(obsDate).isAfter(moment("2016-07-01"))) {
		  			$scope.chartTopChart.series[0].data.push([obsDate, data.indexVol])
		  			$scope.chartTopChart.series[1].data.push([obsDate, data.top10Mean])
		  			$scope.chartTopChart.series[2].data.push([obsDate, data.top20Mean])
		  			$scope.chartTopChart.series[3].data.push([obsDate, data.top30Mean])
		  			$scope.chartTopChart.series[4].data.push([obsDate, data.top40Mean])
		  			$scope.chartTopChart.series[0].data.sort(function(a, b) {
			            return Date.parse(a[0]) - Date.parse(b[0])   
			        })
			        $scope.chartTopChart.series[1].data.sort(function(a, b) {
			            return Date.parse(a[0]) - Date.parse(b[0])   
			        })
			        $scope.chartTopChart.series[2].data.sort(function(a, b) {
			            return Date.parse(a[0]) - Date.parse(b[0])   
			        })
			        $scope.chartTopChart.series[3].data.sort(function(a, b) {
			            return Date.parse(a[0]) - Date.parse(b[0])   
			        })
			        $scope.chartTopChart.series[4].data.sort(function(a, b) {
			            return Date.parse(a[0]) - Date.parse(b[0])   
			        })
			    }
		    }
  		})
  	}
  	function _getPredictData(tradeDate) {
  		$http.get("getPredictFromMongo?date=" + tradeDate).success(function(data) { //get predict data, no need to load realtime stock info
  			$scope.predictList = data;
  		})


  	}
  	function _getTodayData(tradeDate) {
	  $scope.top10Mean = 0
	  $scope.top20Mean = 0
	  $scope.top30Mean = 0
	  $scope.top40Mean = 0
	  $http.get("getPredictFromMongo?date=" + tradeDate).success(function(data) {
	  	var top10Mean = 0, top20Mean = 0, top30Mean = 0, top40Mean = 0

	    $scope.obsList = data;
	    
	    for(var i in data) {
	    	if(i < 10 && data[i].realtimeInfo && parseFloat(data[i].realtimeInfo.open) > 0) {
				top10Mean += (parseFloat(data[i].realtimeInfo.high) - parseFloat(data[i].realtimeInfo.low))/parseFloat(data[i].realtimeInfo.settlement)* 100
	    	}
	    	if(i < 20 && data[i].realtimeInfo && parseFloat(data[i].realtimeInfo.open) > 0) {
				top20Mean += (parseFloat(data[i].realtimeInfo.high) - parseFloat(data[i].realtimeInfo.low))/parseFloat(data[i].realtimeInfo.settlement)* 100
	    	}
	    	if(i < 30 && data[i].realtimeInfo && parseFloat(data[i].realtimeInfo.open) > 0) {
				top30Mean += (parseFloat(data[i].realtimeInfo.high) - parseFloat(data[i].realtimeInfo.low))/parseFloat(data[i].realtimeInfo.settlement)* 100
	    	}
	    	if(i < 40 && data[i].realtimeInfo && parseFloat(data[i].realtimeInfo.open) > 0) {
				top40Mean += (parseFloat(data[i].realtimeInfo.high) - parseFloat(data[i].realtimeInfo.low))/parseFloat(data[i].realtimeInfo.settlement)* 100
	    	}
	    	 _getStockHistory(data[i].stock_id)
	    }
	   
	    $scope.top10Mean = parseFloat(top10Mean/10)
	    $scope.top20Mean = parseFloat(top20Mean/20)
	    $scope.top30Mean = parseFloat(top30Mean/30)
	    $scope.top40Mean = parseFloat(top40Mean/40)
	    //console.info($scope.top10Mean)
	  });
	  // $http.get("getPredict?bottom=true").success(function(data) {

	  //   $scope.predictListBottom = data;
	    
	  // });

	  
	  	
  	}

  //$http.get("getStockHistory?symbol=sh000001").success(function(data) {
  	//var data = data.record
    //$scope.shIndex = data[data.length -1]
    //$scope.lastShIndex = data[data.length -2]
 //    setInterval(function() {
	// 	_getUpdateData()
	// },60*1000*5);
    
  //});
  $scope.chartTopChart = {
      options: {
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x'
        },
        legend: {
          enabled: true
        },
        xAxis: { 
          labels: {
              formatter: function () {
                  return '';
              }
          }
        }    
        
      },
      yAxis: {
        title: {
            text: '振幅%'
        },
        min: 0
      },
      
      title :{
        text : ""
      },
      
      credits: {
        enabled: false
      },
    }
    $scope.chartTopChart.series = [] ;
    $scope.chartTopChart.series.push ({
        type: "spline",
        name:  "上证指数振幅",
        data: [],
    })
    $scope.chartTopChart.series.push ({
        type: "spline",
        name:  "Top 10",
        data: [],
    })
    $scope.chartTopChart.series.push ({
        type: "spline",
        name:  "Top 20",
        data: [],
    })
    $scope.chartTopChart.series.push ({
        type: "spline",
        name:  "Top 30",
        data: [],
    })
    $scope.chartTopChart.series.push ({
        type: "spline",
        name:  "Top 40",
        data: [],
    })

 });
