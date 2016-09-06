'use strict';

angular.module('inspinia')
  .controller('CtpCrol', function ($scope, $rootScope, $http) {
    
    $scope.loadData = function(key) {
      $scope.contestList =[];
      $http.get("getCTPInfo?action=login").success(function(data) {
        
        var loginArr = []; 
        for(var i in data) {
          loginArr.push([moment(data[i].date).format('YYYY-MM-DD'), data[i].count])          
        }
        $scope.ctpLoginChart.series.push({
          type: "spline",
          name:  "登录账户数",
          data: loginArr,
        })
        
      });
      $http.get("getCTPInfo?action=sum").success(function(data) {
        $scope.stat = data;
        var volArr = [], amountArr =[] , datesArr = []
        for(var i in data.dateTrades) {
          datesArr.push({
            date : i,
            tAmount : data.dateTrades[i].tAmount,
            tVol : data.dateTrades[i].tVol
          })
        }
        for(var i in datesArr) {
          amountArr.push([moment(datesArr[i].date,"YYYYMMDD").format('YYYY-MM-DD'), datesArr[i].tAmount])
          volArr.push([moment(datesArr[i].date,"YYYYMMDD").format('YYYY-MM-DD'), datesArr[i].tVol])
        }
        $scope.ctpAmtChart.series.push({
          type: "area",
          name:  "交易额",
          data: amountArr,
        })
        $scope.ctpVolChart.series.push({
          type: "area",
          name:  "交易量",
          data: volArr,
        })
      });
      $http.get("getCTPInfo").success(function(data) {
        $scope.totalCommision = data.totalCommision;
        var commArr = [], avaArr =[] , balArr =[] , withArr =[] ,datesArr = [], cashinArr =[]
        for(var i in data.tradeDates) {
          datesArr.push({
            date : i,
            Commission :  data.tradeDates[i].Commission,
            Available :  data.tradeDates[i].Available,
            Balance :  data.tradeDates[i].Balance,
            Withdraw :  data.tradeDates[i].Withdraw,
            CashIn : data.tradeDates[i].CashIn
          })
        }
        for(var i in datesArr) {
          commArr.push([moment(datesArr[i].date,"YYYYMMDD").format('YYYY-MM-DD'), datesArr[i].Commission])
          avaArr.push([moment(datesArr[i].date,"YYYYMMDD").format('YYYY-MM-DD'), datesArr[i].Available])
          balArr.push([moment(datesArr[i].date,"YYYYMMDD").format('YYYY-MM-DD'), datesArr[i].Balance])
          withArr.push([moment(datesArr[i].date,"YYYYMMDD").format('YYYY-MM-DD'), datesArr[i].Withdraw])
          cashinArr.push([moment(datesArr[i].date,"YYYYMMDD").format('YYYY-MM-DD'), datesArr[i].CashIn])
        }
        $scope.ctpCommChart.series.push({
          type: "spline",
          name:  "手续费",
          data: commArr,
        })
        $scope.ctpAvaChart.series.push({
          type: "spline",
          name:  "可用资金",
          data: avaArr,
        })
        $scope.ctpBalChart.series.push({
          type: "spline",
          name:  "帐户权益",
          data: balArr,
        })
        $scope.ctpWithChart.series.push({
          type: "spline",
          name:  "出金",
          data: withArr,
        })
        $scope.ctpWithChart.series.push({
          type: "spline",
          name:  "入金",
          data: cashinArr,
        })
      });
    }

    
    $scope.ctpVolChart = {
      options: {
        colors: ["#1ab394"],
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
            text: '交易量'
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
    $scope.ctpAmtChart = {
      options: {
        colors: ["#1ab394"],
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
            text: '交易额'
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
    $scope.ctpWithChart = {
      options: {
        colors: ["#D8A8DE", "#1ab394"],
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
            text: '出入额'
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
    $scope.ctpBalChart = {
      options: {
        colors: ["#BDDAF7"],
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
            text: '帐户权益'
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
    $scope.ctpCommChart = {
      options: {
        colors: ["#FDCC99"],
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
            text: '手续费'
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
    $scope.ctpAvaChart = {
      options: {
        colors: ["#A5E6C0"],
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
            text: '可用资金'
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
    $scope.ctpLoginChart = {
      options: {
        colors: ["#1ab394"],
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
            text: '登录帐户数'
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
    $scope.ctpAmtChart.series = [];
    $scope.ctpVolChart.series = [];
    $scope.ctpBalChart.series = [];
    $scope.ctpWithChart.series = [];
    $scope.ctpAvaChart.series = [];
    $scope.ctpCommChart.series = [];
    $scope.ctpLoginChart.series = [];

 });
