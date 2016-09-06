'use strict';

angular.module('inspinia')
  .controller('ChartActiveCtrl', function ($scope, $http, $rootScope) {

    $scope.loadData = function(param) {
      
      $http.get("getActiveUserPer").success(function(data) {
        var globalArr = [], chinaArr = [];
        for(var i = 0;  i < data.global.length; i++) {
          globalArr.push([Date.parse(data.global[i].date), data.global[i].Percentage]);
        }
        for(var i = 0;  i < data.china.length; i++) {
          chinaArr.push([Date.parse(data.china[i].date), data.china[i].Percentage]);
        }
        if($rootScope.roleRegion == "All") {
          $scope.chartConfig.series = [{
            type:"area",
            name: "Mainland %",
            data: chinaArr
          }, {
            type:"area",
            name: "Overseas %",
            data: globalArr
          }]
        } else if($rootScope.roleRegion == "CN") {
          $scope.chartConfig.series = [{
            type:"area",
            name: "Mainland %",
            data: chinaArr
          }]
        } else if($rootScope.roleRegion != "CN") {
          $scope.chartConfig.series = [{
            type:"area",
            name: "Overseas %",
            data: globalArr
          }]
        }
    })
  }


	$scope.chartConfig = {

    //   colors: ["#0000ff", "#ff0066", "#2b908f", "#90ee7e", "#eeaaee",
    // "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        
        options : {
          colors: ["#1ab394","#127E68"],
          chart: {
            backgroundColor: null,
            zoomType: 'x'
          },
          tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%e. %b}: {point.y:.f} %'
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
            },
            floor: Date.UTC(2015, 4, 17)
          },
          yAxis: {
              title: {
                  text: 'Active Users%'
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
        
        credits: {
          enabled: false
        },
        series: $scope.chartSeries
    }

	// $scope.loadData();
        

});
