'use strict';

angular.module('inspinia')
  .controller('MT4ProfileCtrl', function ($scope, $rootScope, $http, $stateParams) {
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });
    $scope.user = {};
    $scope.userClosedList = [];
    $scope.beta = $stateParams.beta

    $scope.closedList = [];
    $http.get("getMT4Account?account=" + $stateParams.accountID).success(function(data) {
      $scope.acc = data[0];
      var trades = data[0].trades, closeTrades = [];
      for(var i in trades) {
        trades[i].closeTimeTs = Date.parse(trades[i].closeTime) / (1000*60);
        trades[i].openTimeTs = Date.parse(trades[i].openTime) / (1000*60)
        if(trades[i].type != "balance" && trades[i].type != "credit")
          closeTrades.push(trades[i])
        
      }
      closeTrades.sort(function(a, b) {
        return new Date(b.closeTime) - new Date(a.closeTime);
      })
      $scope.userClosedList = closeTrades;
      $scope.chartPieConfig.series = []; 
      var dataArr = data[0].openTrades
      var dataOpens =[];
      for(var i in dataArr) {
        dataOpens.push({name: dataArr[i].item, y : Math.abs(dataArr[i].size), sign : (dataArr[i].size >=0? "":"-") })
      }
      $scope.chartPieConfig.series.push ({
        type:"pie",
        name: 'User Profolio',
        data: dataOpens,
        pointPlacement: 'on'
      })

        
      
    })
    $http.get("getMT4AccountDaily?userId=" + $stateParams.accountID).success(function(data) {
      var dataArr = [];
      $scope.chartConfig.series = [];
      
      
      for(var i = 0 ; i < data.length; i++) { 
        dataArr.push([Date.parse(data[i]["TRADE_DATE"]), (parseFloat(data[i]["UNIT_PRICE"]) - 1)*100 ]) 
      }
      //console.info(dataArr)
      if(data && data.length > 0) {                  
        $scope.performance = { 
          BiggestWin : data[0].BiggestWin,
          BiggestLoss :  data[0].BiggestLoss,
          WinRatio : data[0].WinRatio,
          TradesCount : data[0].TradesCount,
          UNIT_PRICE : data[0].UNIT_PRICE,
          ALL_TIME_PNL : data[0].ALL_TIME_PNL,
          CASH_DEPOSITED : data[0].CASH_DEPOSITED
        }
      }
      $scope.chartConfig.series.push ({
        type:"area",
        name: "ROI",
        data: dataArr
      })
    })
    $http.get("getMT4Score?userId=" + $stateParams.accountID).success(function(data) {

      var dataScores = [], dataProfitScores = [];

      if(data.ft_shp_rt) {           
        dataScores.push({y :data.ft_shp_rt.score, ori: data.ft_shp_rt.raw});
      } else {
        dataScores.push(0);
      }
      if(data.ft_tmdd) {          
        dataScores.push({y :data.ft_tmdd.score, ori: data.ft_tmdd.raw});
      } else {
        dataScores.push(0);
      }
      if(data.ft_mdd) {            
        dataScores.push({y :data.ft_mdd.score, ori: data.ft_mdd.raw});
      } else {
        dataScores.push(0);
      }
      if(data.ft_std_neg_pnlr) {            
        dataScores.push({y :data.ft_std_neg_pnlr.score, ori: data.ft_std_neg_pnlr.raw});
      } else {
        dataScores.push(0);
      }
      if(data.ft_bgl) {            
        dataScores.push({y :data.ft_bgl.score, ori: data.ft_bgl.raw});
      } else {
        dataScores.push(0);
      }
      
      $scope.chartRadarFDTScoreConfig.title = {text : "FDT Score: " + data.fdt.score.toFixed(2)};

      $scope.chartRadarConfig.series = [{
        type:"area",
        name: 'Risk Control Score',
        data: dataScores,
        pointPlacement: 'on'
      }]

      if(data.ft_bgw) {            
        dataProfitScores.push({y :data.ft_bgw.score, ori: data.ft_bgw.raw});
      } else {
        dataProfitScores.push(0);
      }
      if(data.ft_roll_price) {            
        dataProfitScores.push({y :data.ft_roll_price.score, ori: data.ft_roll_price.raw});
      } else {
        dataProfitScores.push(0);
      }
      if(data.ft_streak) {            
        dataProfitScores.push({y :data.ft_streak.score, ori: data.ft_streak.raw});
      } else {
        dataProfitScores.push(0);
      }

      //$scope.chartRadarProfitConfig.subtitle = {text : "Profitability Score: " + data.profitScore};
      $scope.chartRadarProfitConfig.series= [{
        type:"area",
        name: 'Profitability Score',
        data: dataProfitScores,
        pointPlacement: 'on'
      }]

      $scope.chartRadarRiskPreferenceConfig.series = []; 

      var dataScores = []

      if(data.ft_avg_dr) {           
        dataScores.push({y : (100 - data.ft_avg_dr.score), ori: data.ft_avg_dr.raw});
      } else {
        dataScores.push(0);
      }
      if(data.ft_df_qty) {          
        dataScores.push({y :data.ft_df_qty.score, ori: data.ft_df_qty.raw});
      } else {
        dataScores.push(0);
      }
      if(data.ft_avg_max_op) {            
        dataScores.push({y :(100 - data.ft_avg_max_op.score), ori: data.ft_avg_max_op.raw});
      } else {
        dataScores.push(0);
      }
      if(data.ft_avg_ngt_op) {            
        dataScores.push({y :(100 - data.ft_avg_ngt_op.score), ori: data.ft_avg_ngt_op.raw});
      } else {
        dataScores.push(0);
      }
      

      $scope.chartRadarRiskPreferenceConfig.series= [{
        type:"area",
        name: 'Risk Preference Score',
        data: dataScores,
        pointPlacement: 'on'
      }]
      $scope.chartRadarFDTScoreConfig.title = {text : "FDT Score: " + data.fdt.score.toFixed(2)};
      $scope.chartRadarFDTScoreConfig.series = []; 
      var dataScores = []

      dataScores.push(data.riskCtrl.score);
      //dataScores.push(data.riskPrefScore);
      dataScores.push(data.profitability.score);
      dataScores.push(data.consistency.score);
      dataScores.push(data.activity.score);


      //$scope.chartRadarFDTScoreConfig.subtitle = {text : "FDT Score: " + data.fdt.score};

      $scope.chartRadarFDTScoreConfig.series =[{
        type:"area",
        name: 'FDT Score',
        data: dataScores,
        pointPlacement: 'on',

      }]
    });

    $scope.chartRadarFDTScoreConfig = {
      options : {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          polar: true,
          type: 'line'
        } ,
        pane: {
          size: '80%'
        },
        tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.2f}</b><br/>'
        }
      },

      title: {
        text: '',
      },

      pane: {
        size: '80%'
      },

      xAxis: {
        categories: ['Risk Control(风险控制能力)', 'Profitability(盈利能力)', 'Steadiness(稳定性)','Activeness(活跃度)'],
        tickmarkPlacement: 'on',
        lineWidth: 0
      },

      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: 100
      },

      

      legend: {
        align: 'right',
        verticalAlign: 'top',
        y: 70,
        layout: 'vertical'
      },
      //series: $scope.chartSeries
      }
      $scope.chartConfig = {
        options: {
          colors: ["#1ab394"],
          plotOptions: {
              series: {
                  cursor: 'pointer',
                  point: {
                      events: {
                          click: function(e) {
                            console.info(this.category)
                              var tDAte = moment(this.category).format("YYYY-MM-DD");
                              _filterTradeDate(tDAte)
                          }
                      }
                  }
                      
              }
            },
          chart: {
            // events: {
            //   click: function (event) {
            //     var tDAte = moment(event.xAxis[0].value).format("YYYY-MM-DD");
            //     _filterTradeDate(tDAte)

            //   }
            // },
            backgroundColor:'rgba(255, 255, 255, 0.1)',
            zoomType: 'x'
          },
          legend: {
            enabled: false
          }
        },
        title :{
          text : "ROI Trend"
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
          labels: {
            enabled: true
          },
          title: {
            text: null
          }
        },
        tooltip: {
          headerFormat: '<b>{series.name}</b><br>',
          pointFormat: '{point.x:%e. %b}: {point.y:.f} users'
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
      $scope.chartRadarConfig = {
      options : {
        colors: ["#A5E6C0"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          polar: true,
          type: 'line'
        } ,
        pane: {
          size: '80%'
        },
        tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/><span style="color:{series.color}">Origin: <b>{point.ori:,.2f}</b>'
        }
      },

      title: {
        text: '',
      },

      pane: {
        size: '80%'
      },

      xAxis: {
        categories: ['Annual Sharpe Ratio (年化夏普比例)', 'Timed Maximum Drawdown (最大回撤日均值)', 'Draw-down (收益回撤控制)', 'Loss variance (损失波动控制)',
                'Order loss (单笔损失控制)'],
        tickmarkPlacement: 'on',
        lineWidth: 0
      },

      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: 100
      },

      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
      },

      legend: {
        align: 'right',
        verticalAlign: 'top',
        y: 70,
        layout: 'vertical'
      },
      //series: $scope.chartSeries
    }
    $scope.chartRadarRiskPreferenceConfig = {
      options : {
        colors: ["#A5E6C0"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          polar: true,
          type: 'line'
        } ,
        pane: {
          size: '80%'
        },
        tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/><span style="color:{series.color}">Origin: <b>{point.ori:,.2f}</b>'
        }
      },

      title: {
        text: '',
      },

      pane: {
        size: '80%'
      },

      xAxis: {
        categories: ['Open Position Duration(持仓时间)', 'Default Qty Ratio(默认交易量比例)', 'Max Open Position(最大仓位)', 'Overnight Open Position(隔夜仓位)'],
        tickmarkPlacement: 'on',
        lineWidth: 0
      },

      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: 100
      },

      

      legend: {
        align: 'right',
        verticalAlign: 'top',
        y: 70,
        layout: 'vertical'
      },
      //series: $scope.chartSeries
    }
    $scope.chartRadarProfitConfig = {
      options : {
        colors: ["#A5E6C0"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          polar: true,
          type: 'line'
        } ,
        pane: {
          size: '80%'
        },
        tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/><span style="color:{series.color}">Origin: <b>{point.ori:,.2f}</b>'
        }
      },

      title: {
        text: '',
      },

      pane: {
        size: '80%'
      },

      xAxis: {
        categories: ['Biggest Win(最大獲利)', 'Roll Price(交易時段回報率)', 'Streak(連續盈利天數)'],
        tickmarkPlacement: 'on',
        lineWidth: 0
      },

      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: 100
      },

      

      legend: {
        align: 'right',
        verticalAlign: 'top',
        y: 70,
        layout: 'vertical'
      },
      //series: $scope.chartSeries
    }
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
          pointFormat: 'Qty: <b>{point.sign}{point.y}</b> <br> {point.percentage:.1f} %'
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
      text: 'Portfolio',
    },
      //series: $scope.chartSeries
  }
});
