'use strict';

angular.module('inspinia')
  .controller('ChartComLineCtrl', function ($scope, $http) {
  	
  	$scope.loadData = function(param) {
  		$http.get("getDataFromFile?file=" + param).success(function(data) {
  			data = data.data
  			var rankRegion = [];
        var rankRegionName = [];
        var rankRegionBasic = {}
        rankRegionBasic = {"Others" : 0}
        var others = {}; // sum of other regions,
        var top = {};
        for(var i = 0 ; i < data["Global_Country_TU"].length && i < 5; i ++) { //find top 4
          rankRegion.push(data["Global_Country_TU"][i]);
          rankRegionName.push(data["Global_Country_TU"][i].Country);
          rankRegionBasic[data["Global_Country_TU"][i].Country] =  0;
        }
        for(var i = 0 ; i < data["Date_Global_Country_TU"].length; i++) {
          if(rankRegionName.indexOf(data["Date_Global_Country_TU"][i].country) >= 0 ) { // if this region in top 4
            if(data["Date_Global_Country_TU"][i].country == "TW")
              console.info(data["Date_Global_Country_TU"][i])
            var sum = rankRegionBasic[data["Date_Global_Country_TU"][i].country] + parseInt(data["Date_Global_Country_TU"][i]["Total Users"])
            rankRegionBasic[data["Date_Global_Country_TU"][i].country] = sum
            var arr = [Date.parse(data["Date_Global_Country_TU"][i].date), sum];
            if(top[data["Date_Global_Country_TU"][i].country] && top[data["Date_Global_Country_TU"][i].country].length > 0) {
              top[data["Date_Global_Country_TU"][i].country].push(arr);
            } else {
              top[data["Date_Global_Country_TU"][i].country] = [];
              top[data["Date_Global_Country_TU"][i].country].push(arr)
            }
          } else { //others
            var sum = rankRegionBasic["Others"] + parseInt(data["Date_Global_Country_TU"][i]["Total Users"])
            rankRegionBasic["Others"] = sum
            var arr = [Date.parse(data["Date_Global_Country_TU"][i].date), sum];
            if(top["Others"] && top["Others"].length > 0) {
              top["Others"].push(arr);
            } else {
              top["Others"] = [];
              top["Others"].push(arr)
            }
          }
        }
        var seriesData = []; rankRegionName.push("Others")
        for(var k in rankRegionName) {
          seriesData.push({
            name : rankRegionName[k],
            data : top[rankRegionName[k]]
          })
        }
        $scope.chartConfig.series = seriesData
        });
  	}

	$scope.chartConfig = {
    //   colors: ["#0000ff", "#ff0066", "#2b908f", "#90ee7e", "#eeaaee",
    // "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        options : {
            chart: {
              backgroundColor: null,
                zoomType: 'x'
            }
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

	// $scope.loadData();
        

    });
