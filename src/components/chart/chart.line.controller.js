'use strict';

angular.module('inspinia')
  .controller('ChartCtrl', function ($scope, $http, $rootScope) {
  	
  	$scope.$on('changeSelector', function(e, d) {
  		console.info(d)
  	})
    $rootScope.TotalGlobalTrendObj = {}
    $rootScope.TotalChinaTrendObj = {};
  	$scope.loadData = function(param) {
  		$http.get("getDataFromFile?file=" + param).success(function(data) {
  			data = data.data
  			var seriseCount = param.split("|")
  			$scope.chartConfig.series = [];
  			
          	
		    for(var k = 0 ; k < seriseCount.length; k ++) {
		    	var dataArr = [];
		    	for(var i = 0 ; i < data[seriseCount[k]].length; i ++) {
			      dataArr.push([Date.parse(data[seriseCount[k]][i].date), parseInt(data[seriseCount[k]][i][$scope.valueName])])
			      // if(seriseCount[k] == "Date_TU_Global") {
         //      $rootScope.TotalGlobalTrendObj[data[seriseCount[k]][i].date] = parseFloat(data[seriseCount[k]][i][$scope.valueName])
         //    } 
         //    if(seriseCount[k] == "Date_TU_China") { 
         //      $rootScope.TotalChinaTrendObj[data[seriseCount[k]][i].date] = parseFloat(data[seriseCount[k]][i][$scope.valueName])
         //    }
          }
          if($rootScope.roleRegion == "All") {
          
  	        $scope.chartConfig.series.push ({
              type:"area",
  		        name: $scope[seriseCount[k]],
  		        data: dataArr
  		      })
          } else if($rootScope.roleRegion == "CN" && (seriseCount[k].indexOf("China") >= 0 || seriseCount[k].indexOf("Overlap") >= 0)) {
            $scope.chartConfig.series.push ({
              type:"area",
              name: $scope[seriseCount[k]],
              data: dataArr
            })
          } else if($rootScope.roleRegion != "CN" && seriseCount[k].indexOf("Global") >= 0) {
            $scope.chartConfig.series.push ({
              type:"area",
              name: $scope[seriseCount[k]],
              data: dataArr
            })
          }
		        
		    }		 
        if (param == "Date_TU_Global|Date_TU_China") { // sum total user
          var gb_tu = data["Date_TU_Global"];
          var cn_tu = data["Date_TU_China"];
          $rootScope.totalUsersChina = parseInt (cn_tu[cn_tu.length - 1][$scope.valueName])
          $rootScope.totalUsersGlobal = parseInt (gb_tu[gb_tu.length - 1][$scope.valueName]) 
        }
      });
      
  	}

	$scope.chartConfig = {
    options: {
      chart: {
        backgroundColor: null,
        zoomType: 'x'
      }
      //colors: ["#127E68","#17A084","#f8ac59", "#23c6c8", "#1c84c6"]
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { // don't display the dummy year
        month: '%b. %e',
        year: '%b'
      },

      title: {
        text: 'Date'
      }
    },
    yAxis: {
        title: {
            text: 'Users'
        },
        min: 0
    },
    tooltip: {
        headerFormat: '<b>{series.name}</b><br>',
        pointFormat: '{point.x:%e. %b}: {point.y:.f} users'
    },
    legend: {
      enabled: true
    },
    plotOptions: {
      area: {
        color: '#0038ff',
        marker: {
          enabled: null
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1
          }
        },
        threshold: null
      }
    },
    credits: {
      enabled: false
    },
    series: $scope.chartSeries
  }       

});
