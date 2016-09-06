'use strict';

angular.module('inspinia')
  .controller('QuantCrol', function ($scope, $rootScope, $http) {
    
    $scope.chartConfig = {
      options:{
        chart: {
          backgroundColor: null,
            zoomType: 'x'
        },
        title :{
          text : "User Growth"
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
          }
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
    }
    $scope.chartConfig.series = [];
    console.info("quant...")
    $http.get("getSymbol?symbol=EURJPY").success(function(data) {
        var price = [] , max20 = [], min10 = [];      
        for(var i = 19 ; i < data.length; i ++) {
          price.push([Date.parse(data[i].KEYTIME), data[i].CLOSE_PRICE -130])
          max20.push([Date.parse(data[i].KEYTIME), data[i].max20-130])
          min10.push([Date.parse(data[i].KEYTIME), data[i].min10-130])
        }
        $scope.chartConfig.series.push ({
          type:"spline",
          name: "Close Price",
          data: price
        },{
          type:"spline",
          name: "Max 20",
          data: max20
        },{
          type:"spline",
          name: "Min10",
          data: min10
        })
    });
 });
