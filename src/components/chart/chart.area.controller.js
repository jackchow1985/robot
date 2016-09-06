'use strict';

angular.module('inspinia')
  .controller('ChartAreaCtrl', function ($scope, $http, $rootScope) {
    $rootScope.activeGlobalTrendObj = {};
    $rootScope.activeChinaTrendObj = {};
    $scope.loadData = function(param) {
      
      $http.get("getDataFromFile?file=" + param).success(function(data) {
        data = data.data
        var seriseCount = param.split("|")
        $scope.chartConfig.series = [];
        
        var activePercentage = [];
        for(var k = 0 ; k < seriseCount.length; k ++) {
          var dataArr = [];
          for(var i = 0 ; i < data[seriseCount[k]].length; i ++) {
                     
            dataArr.push([Date.parse(data[seriseCount[k]][i].date), parseInt(data[seriseCount[k]][i][$scope.valueName])])
            
            
          }

          // for(var i = 0 ; i < dataArr.length; i ++) {
          //   activePercentage.push([dataArr[i][0], parseFloat(dataArr[i][1]/$rootScope.activeGlobalFXUsers*100)])
          // }
              $scope.chartConfig.series.push ({
                type:"area",
                name: $scope[seriseCount[k]],
                data: dataArr
              }
              // , 
              // {
              //   type:"line",
              //   name: "Active Percentage",
              //   data: activePercentage
              // }
              )
            
        }
      });
    }

  $scope.chartConfig = {
    //   colors: ["#0000ff", "#ff0066", "#2b908f", "#90ee7e", "#eeaaee",
    // "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        
        options : {
          chart: {
            backgroundColor: null,
              zoomType: 'x'
          },
          plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
          }
        },
        // options: {
        //   chart : {
        //     type : "area"
        //   }
        // },
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
