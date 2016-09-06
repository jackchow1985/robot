'use strict';

angular.module('inspinia')
  .controller('IncUserListCrol', function ($scope, $rootScope, $http, $filter) {
    
    //var usersList = [];
    $scope.rowCollection = []
    // $scope.rowCollection = [
    //     {firstName: 'Laurent', lastName: 'Renard', birthDate: new Date('1987-05-21'), balance: 102, email: 'whatever@gmail.com'},
    //     {firstName: 'Blandine', lastName: 'Faivre', birthDate: new Date('1987-04-25'), balance: -2323.22, email: 'oufblandou@gmail.com'},
    //     {firstName: 'Francoise', lastName: 'Frere', birthDate: new Date('1955-08-27'), balance: 42343, email: 'raymondef@gmail.com'}
    // ];
    $scope.historyFilePath = "getIncuList?format=csv";
    $scope.historyFileName = $filter('date')(new Date(), "yyyy-MM-dd") + "_incubatee.csv"; 
    $scope.loadIncuData = function(key) {
      $http.get("getIncuList").success(function(data) {
       $scope.userList = data
      });
      
      $http.get("getIncuSummary").success(function(data) {
       $scope.summaryList = data;
        var dataSymbols = []
        for(var i in data) {
        	dataSymbols.push({name: data[i].SYMBOL, y : data[i].QTY, pnl : data[i].PNL })
        }
        $scope.chartPieConfig.series = [{
          type:"pie",
          name: '',
          data: dataSymbols,
          pointPlacement: 'on'
        }]

      });

      $http.get("getIncuCount").success(function(data) {
       $scope.summaryObj = data
       

      });
    }
    $scope.loadIncuData();
    $scope.chartPieConfig = {
      options : {
        //colors: ["#1ab394", "#0E620A", "#38B431", "#51CF4A", "#1EDE14"],
        colors: ["#1ab394", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
      "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          style: {
             fontFamily: "'Unica One', sans-serif"
          },
          legend: {
            enabled: true
          },
          plotBorderColor: '#606063',
          type: 'pie',
          options3d: {
            enabled: true,
            alpha: 45,
            beta: 0
          }
        },
        tooltip: {
          pointFormat: 'Qty: <b>{point.y}</b> <br> PNL: <b>{point.pnl}</b> <br> {point.percentage:.1f} %'
        },
        plotOptions: {
              pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  depth: 35,
                  dataLabels: {
                      enabled: true,
                      format: '{point.name}'
                  }
              }
          },
        rangeSelector: {
          buttonTheme: {
             fill: 'white',
             stroke: '#C0C0C8',
             'stroke-width': 1,
             states: {
                select: {
                   fill: '#D0D0D8'
                }
             }
          }
      },
      scrollbar: {
        trackBorderColor: '#C0C0C8'
      } 
    },

    title: {
      text: 'Symbols',
    },
      //series: $scope.chartSeries
  }
 });
