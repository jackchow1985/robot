'use strict';

angular.module('inspinia')
  .controller('UserProfileCtrl', function ($scope, $rootScope, $http, $stateParams) {
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });
    $scope.seedsc = $stateParams.region == "SEEDSC" && $stateParams.app == "SC";
    $scope.contests = {}
    $http.get("getAllContestByApp?db=TW&app=FX").success(function(data) { 
      for(var i in data) {   
        if(data[i].name) {  
          $scope.contests[data[i].contest_id] = data[i]
        }
      }
      //$scope.contestSelected = $scope.contests[0]

    })

    $http.get("getAllContestByApp?db=CN&app=FX").success(function(data) {
      for(var i in data) {     
        if(data[i].name) {  
          $scope.contests[data[i].contest_id] = data[i]
        }
      }


    })
    $http.get("getAllContestByApp?db=CN&app=FC").success(function(data) {
      for(var i in data) {     
        if(data[i].name) {  
          $scope.contests[data[i].contest_id] = data[i]
        }
      }


    })
    $http.get("getAllContestByApp?db=CN&app=SC").success(function(data) {
      for(var i in data) {     
        if(data[i].name) {  
          $scope.contests[data[i].contest_id] = data[i]
        }
      }
    })
    $scope.dateRange = { "startDate": moment($rootScope.lastUpdate).subtract(2, 'years'), "endDate": new Date($rootScope.lastUpdate) } 
    $scope.products = [{
        name : 'FX',
        id : '1'
      },{
        name : 'FC',
        id : '2'
      },{
        name : 'SC',
        id : '3'
    }];

    $scope.userClosedList = []
    if($rootScope.roleRegion == "All" ) {
      $scope.regions = [{
        name : 'Global',
        id : 'Global'
      },{
        name : 'CN',
        id : 'CN'
      },{
        name : 'INC-China',
        id : 'INC'
      },{
        name : 'INC-Global',
        id : 'GlobalINC'
      }];
    } else if($rootScope.roleRegion == "CN") {
      $scope.regions = [{
        name : 'CN',
        id : 'CN'
      },{
        name : 'INC-China',
        id : 'INC'
      }];
    } else if($rootScope.roleRegion != "CN") {
      $scope.regions = [{
        name : $rootScope.roleRegion,
        id : $rootScope.roleRegion
      },{
        name : 'INC-Global',
        id : 'GlobalINC'
      }];
    }
    $scope.productSelected = $scope.products[0]
    $scope.regionSelected = $scope.regions[0];
    $scope.closedList = [];
    $scope.scoreProductSelected = $scope.products[0]
    $scope.loadMore = function() {
      $scope.userClosedList = $scope.closedList
    }
    $scope.sideMap = {}, $scope.filteredList = [];

    $scope.tradeDateCancelClick = function() {
      $scope.selectTradeDates = null;
      $scope.userClosedList = $scope.closedList;
    }
    function _filterTradeDate(date) {
      console.info(date)
      $scope.selectTradeDates = date;
      $scope.filteredList = [];
       for(var i = 0 ; i < $scope.closedList.length; i++) {
        if(moment($scope.closedList[i].TRADE_DATE).format("YYYY-MM-DD") == date)
          $scope.filteredList.push($scope.closedList[i])
      }
      console.info($scope.filteredList)
      $scope.$apply();
      
      //console.info($scope.userClosedList)
    }
    $scope.$watch('filteredList', function() {
      console.info("update close position list")
      $scope.userClosedList = $scope.filteredList;
    });
    function _getTradeSide(app, db, userID) {
      var objIds = [], idsArr = [], count = 0
      for(var i = 0 ; i < $scope.closedList.length; i++) {
        if(count < 50) {
          count++;
          objIds.push($scope.closedList[i].ObjId)
        } else {
          idsArr.push(objIds);
          objIds = [$scope.closedList[i].ObjId];
          count =0;
        }
      }
      if(idsArr.length == 0 && objIds.length > 0)
        idsArr.push(objIds);
      for(var k in idsArr) {
        var ids = idsArr[k]
        $http.post("getTradeSide?userID=" + userID, {db:db, app: app, objIds : ids}).success(function(data) {
          if(data)
            for(var i in data) {
              $scope.sideMap[data[i].OBJECT_ID] = { 
                side: (data[i].SIDE == "Buy"? "Long" : "Short"), 
                ts : moment(data[i].CREATED).toDate().getTime()/(1000*60)
              }
            }
        })
      }
      
    }

    $scope.loadData = function(refresh) {
      $scope.refresh = refresh;
      //$scope.range = moment().range($scope.dateRange.startDate, $scope.dateRange.endDate);
      var userID = $stateParams.userID || $scope.inputUserId;
      var contestID = "" 
      if($stateParams.userID && $stateParams.userID.indexOf("_1_*1_*1_") >=0) { //has contest id
        contestID = $stateParams.userID.split("_1_*1_*1_")[0];
        userID = $stateParams.userID.split("_1_*1_*1_")[1];
      } 
      if($scope.contestSelected && $scope.contestSelected.CONTEST_ID) {
        contestID = $scope.contestSelected.CONTEST_ID;
      }
      var db = $stateParams.region || $scope.regionSelected.id;
      var app = $stateParams.app || $scope.productSelected.name;
      $scope.db = db;
      $scope.app = app;
      $http.get("getUserInfo?userID=" + userID + "&db=" + db).success(function(data) {
        if(data && data.length > 0) {
          $scope.user = data[0];
          $scope.joinDate =Date.parse(new Date(data[0].CREATED))
          loadProfileDetails(userID, db, app, contestID, refresh)
        } else {
          $http.get("getUserInfoByName?userName=" + userID + "&db=" + db).success(function(dataUserName) {
            if(dataUserName && dataUserName.length > 0) {
              $scope.user = dataUserName[0];
              loadProfileDetails(dataUserName[0].USERID, db, app, contestID, refresh)
            } else if(userID.indexOf("-") >= 0) { // may be reset user
              var resetUserId = userID.split("-")[0]
              $http.get("getUserInfo?userID=" + resetUserId + "&db=" + db).success(function(data) {
                if(data && data.length > 0) {
                  $scope.user = data[0];
                  $scope.joinDate =Date.parse(new Date(data[0].CREATED))
                  loadProfileDetails(userID, db, app, contestID, refresh)
                }
              })
            }
            
          })
        }
      })
    }

    function loadProfileDetails(userID, db, app, contestID, refresh) {       
      $scope.beta = $stateParams.beta
      $scope.region = $stateParams.region;
      $scope.historyFilePath = "getClosedTrades?format=csv&userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"");
      $scope.historyFileName = userID + ".csv"
      $http.get("getClosedTrades?userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(data) {
        var tradeListData = []
        for(var i in data) {
          if(moment(data[i].TRADE_DATE) >= $scope.dateRange.startDate && moment(data[i].TRADE_DATE) <= $scope.dateRange.endDate) {
            data[i].ObjId = data[i].POSITION_ID.split('_')[0];
            data[i].CREATED = moment(data[i].CREATED).toDate().getTime()/(1000*60)
            tradeListData.push(data[i])
          }
        }
        tradeListData.sort(function(a, b) {
          return Date.parse(a.TRADE_DATE) -Date.parse(b.TRADE_DATE)      
        })
        tradeListData = tradeListData.reverse();
        $scope.closedList = tradeListData;
        $scope.rankListLoading = false;
        $scope.loaded= false;
        $scope.userClosedList = tradeListData;
        _getTradeSide(app, db, userID);
      });
      if(db != "SEED" && db != "INC") {
        $http.get("getContestByApp?userID=" + userID + "&db=" + db + "&app=" + app).success(function(data) {
          //$scope.contestSelectedList = [{name: "Normal"}]
          // $scope.contestSelectedList = $scope.contestSelectedList.concat(data);
          // $scope.selectedContest = $scope.contestSelectedList[0]
          $scope.contestList = data
        })
      }
      // $http.get("getUserInfo?userID=" + userID + "&db=" + db).success(function(data) {
      //   $scope.user = data[0]
      // })
      $http.get("getUserLastLogin?userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(data) {
        $scope.userLastLogin = data[0]
      })
      $http.get("getUserAccountSetting?userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(data) {
        $scope.userSetting = data[0]
      })
      $scope.chartPNLConfig.series = [];
      if($scope.seedsc) {
        $http.get("getSeedSCStat?type=eff&userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(data) {
          $scope.chartPNLConfig.series = [];
          var dataPNLEffArr = [];
          for(var i = 0 ; i < data.length; i++) {
            dataPNLEffArr.push([Date.parse(data[i]["trade_date"]), parseFloat(data[i]["daily_eff"])])
          }
          $scope.chartPNLConfig.series.push ({
            type:"bar",
            name: "Daily P&L Efficiency",
            data: dataPNLEffArr
          })
        })
        $http.get("getSeedSCStat?type=commision&userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(data) {
          $scope.chartCommisionConfig.series = [];
          var dataCommisionArr = [];
          for(var i = 0 ; i < data.length; i++) {
            dataCommisionArr.push([Date.parse(data[i]["trade_date"]), parseFloat(data[i]["daily_commission"])])
          }
          $scope.chartCommisionConfig.series.push ({
            type:"bar",
            name: "Daily Commision",
            color: "#f8ac59",
            data: dataCommisionArr
          })
        })
        $http.get("getSeedSCStat?type=pos&userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(data) {
          $scope.stats_pos = data;
          
        })
        $http.get("getSeedSCStat?type=pnl&userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(data) {
          $scope.stats_pnl = data;
          
        })
      }
      $http.get("getUserAccDaily?userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(data) {
        var dataArr = [], dataAccValueArr = [], dataCashValueArr = [], dataRankingArr = [], dataPNLArr = [],
        dataTradeCountArr = [], dataRollPriceArr = [];
        $scope.chartConfig.series = [];
        $scope.chartValueConfig.series = [];
        $scope.chartRankingConfig.series = [];
        $scope.chartRollPriceConfig.series = [];
        
        $scope.chartTradeCountConfig.series = [];
        
        for(var i = 0 ; i < data.length; i++) {
          if(moment(data[i]["TRADE_DATE"]) >= $scope.dateRange.startDate && moment(data[i]["TRADE_DATE"]) <= $scope.dateRange.endDate) {
            if(!$scope.seedsc) {
              dataArr.push([Date.parse(data[i]["TRADE_DATE"]), (parseFloat(data[i]["UNIT_PRICE"]) - 1)*100 ])
            }
            else{
              dataArr.push([Date.parse(data[i]["TRADE_DATE"]), parseFloat(data[i]["ALL_TIME_PNL"])])
            }
            dataCashValueArr.push([Date.parse(data[i]["TRADE_DATE"]), parseFloat(data[i]["CASH"])])
            dataAccValueArr.push([Date.parse(data[i]["TRADE_DATE"]), parseFloat(data[i]["UNIT_PRICE"]) * parseFloat(data[i]["CASH_DEPOSITED"]) ])
            dataRankingArr.push([Date.parse(data[i]["TRADE_DATE"]), parseInt(data[i]["Ranking"])])
            if(!$scope.seedsc) {
              dataPNLArr.push([Date.parse(data[i]["TRADE_DATE"]), parseInt(data[i]["PNL"])])
            } 
            dataTradeCountArr.push([Date.parse(data[i]["TRADE_DATE"]), parseInt(data[i]["UR_PNL"])])
            dataRollPriceArr.push([Date.parse(data[i]["TRADE_DATE"]), (parseFloat(data[i]["ROLL_PRICE"])) ])
          }
        }
        //console.info(dataArr)
        if(data && data.length > 0) {
          if($scope.dateRange && $scope.dateRange.endDate) {
            for(var i in data) {
              if(moment(data[i].TRADE_DATE).format("YYYYMMDD") == moment($scope.dateRange.endDate).format("YYYYMMDD")){
                $scope.acc = data[i];
              } else {
                 $scope.acc = data[0];
              }
            }
          }
          $scope.refresh = false;
        }
        $scope.accFirstDate = Date.parse(new Date(data[data.length - 1].TRADE_DATE));
        $scope.chartConfig.series.push ({
          type:"area",
          name: ($scope.seedsc?"All Time P&L" : "ROI"),
          data: dataArr
        })
        $scope.chartRankingConfig.series.push ({
          type:"line",
          name: "Ranking",
          data: dataRankingArr
        })
        $scope.chartValueConfig.series.push ({
          type:"line",
          name: "Account Value",
          data: dataAccValueArr
        },{
          type:"line",
          name: "Cash Value",
          data: dataCashValueArr
        })
        $scope.chartRollPriceConfig.series.push ({
          type:"line",
          name: "Roll Price",
          data: dataRollPriceArr
        })
        $scope.chartTradeCountConfig.series.push ({
          type:"line",
          name: "UR_PNL",
          data: dataTradeCountArr
        })
        if(!$scope.seedsc) {
          $scope.chartPNLConfig.series.push ({
            type:"line",
            name: "Daily P&L",
            data: dataPNLArr
          })
        }
        
      });
      $scope.chartPieConfig.series = []; 
      $http.get("getUserOpenPositions?userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(dataArr) { 
        var dataOpens = []
        for(var i in dataArr) {
          dataOpens.push({name: dataArr[i].SYMBOL, y : Math.abs(dataArr[i].qty), sign : (dataArr[i].qty >=0? "":"-") })
        }
        $scope.chartPieConfig.series.push ({
          type:"pie",
          name: 'Open Positions',
          data: dataOpens,
          pointPlacement: 'on'
        })
      });
      $http.get("getDailyLogin?userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(data) {
        var dataArr = [];
        $scope.chartLoginConfig.series = [];
        for(var i = 0 ; i < data.length; i++) {
          if(moment(data[i]["date"]) >= $scope.dateRange.startDate && moment(data[i]["date"]) <= $scope.dateRange.endDate)
            dataArr.push([Date.parse(data[i]["date"]), data[i]["count"]])
        }
        $scope.chartLoginConfig.series.push ({
          type:"column",
          name: "App Open Times",
          data: dataArr
        })
      });
      
      $http.get("getDailyTrades?userID=" + userID + "&db=" + db + "&app=" + app + (refresh?"&refresh=true":"")).success(function(data) {
        var dataArrTrades = [], dataArrFills = [];
        $scope.chartTradesConfig.series = [];
        for(var i = 0 ; i < data.length; i++) {
          if(moment(data[i]["trade_date"]) >= $scope.dateRange.startDate && moment(data[i]["trade_date"]) <= $scope.dateRange.endDate) {
            dataArrTrades.push([Date.parse(data[i]["trade_date"]), parseInt(data[i]["tradeCount"]) - parseInt(data[i]["fillCount"])])
            dataArrFills.push([Date.parse(data[i]["trade_date"]), parseInt(data[i]["fillCount"])])
          }
        }
        $scope.chartTradesConfig.series.push ({
          name: "New/Cancel",
          data: dataArrTrades
          },{
            name: "Filled",
            data: dataArrFills
          })
      });
      $scope.chartRadarConfig.series = [];
      $scope.chartRadarProfitConfig.series = []; 
      

      function _loadScore() {
        var dateString = $scope.dateRangeChanged ? "trade_date=" + moment($scope.dateRange.endDate).format("YYYY-MM-DD") + "&" : "" 
        $http.get("getScoreDisplay").success(function(data) { 
          var score = data
          $http.get("getUserFeatures?" + dateString + "col=" + app.toLowerCase() + "&debug=true&allScores=true&userID=" +  userID + "&region=" + db + "&app_id=" + app.toLowerCase() + "&contest_id=" + contestID + ($scope.seedsc?"&wt_tg=fsw_day_trade":"" ) + (db == "INC" ? "&wt_tg=fsw_inc_1" : "")).success(function(datas) { 
              if(datas.length == 0 ) {
                console.info("no fdt score")
                $scope.chartRadarFDTScoreConfig.series = [];
                $scope.chartSeedSCScoreConfig.series = [];
                $scope.chartSeedStyleScoreConfig.series = [];
                $scope.chartRadarRiskPreferenceConfig.series = [] 
                $scope.chartRadarProfitConfig.series = [];
                $scope.chartRadarConfig.series = [];
                $scope.chartRadarFDTScoreConfig.title = {text : "FDT Score is computing"};
                $scope.chartSeedStyleScoreConfig.title = {text : "Trader Styles"};
              } else {
                var data = {};
                $scope.contestScoresList = []
                for(var i in datas) {
                  if(datas[i]["ap_tg"].indexOf("sim_all") >= 0) // score for user
                    data = datas[i]
                  else {  // contest scores info
                    if(datas[i].ap_tg && datas[i].ap_tg.split("_").length > 2) {
                      datas[i].contestId = datas[i].ap_tg.split("_")[2]
                      $scope.contestScoresList.push(datas[i])
                    }
                  }
                }
                if(contestID && $scope.contestScoresList && $scope.contestScoresList.length >0) {
                  data = $scope.contestScoresList[0]
                }
                console.info($scope.contests)
                var dataScores = [], dataProfitScores = [];
                var fts = score["risk_control"].features;
                for(var i in fts) {
                  var dataft = data[fts[i].feature]
                  if(dataft) {           
                    dataScores.push({y :dataft.score, ori: dataft.raw});
                  } else {
                    dataScores.push(0);
                  }
                  cateRiskCtrl.push(fts[i].name)
                }                

                $scope.chartRadarConfig.series = [{
                  type:"area",
                  name: 'Risk Control Score',
                  data: dataScores,
                  pointPlacement: 'on'
                }]

                fts = score["profitability"].features;
                for(var i in fts) {
                  var dataft = data[fts[i].feature]
                  if(dataft) {           
                    dataProfitScores.push({y :dataft.score, ori: dataft.raw});
                  } else {
                    dataProfitScores.push(0);
                  }
                  cateProfit.push(fts[i].name)
                }

                //$scope.chartRadarProfitConfig.subtitle = {text : "Profitability Score: " + data.profitScore};
                $scope.chartRadarProfitConfig.series= [{
                  type:"area",
                  name: 'Profitability Score',
                  data: dataProfitScores,
                  pointPlacement: 'on'
                }]

                $scope.chartRadarRiskPreferenceConfig.series = []; 

                var dataPreferScores = []
                fts = score["risk_preference"].features;
                for(var i in fts) {
                  var dataft = data[fts[i].feature]
                  if(dataft) { 
                    var y = dataft.score
                    if(fts[i].reversedFrom) {
                        y = fts[i].reversedFrom - dataft.score          
                    }
                    dataPreferScores.push({y :y, ori: dataft.raw});
                  } else {
                    dataPreferScores.push(0);
                  }
                  cateRiskPref.push(fts[i].name)
                }
                
                

                $scope.chartRadarRiskPreferenceConfig.series= [{
                  type:"area",
                  name: 'Risk Preference Score',
                  data: dataPreferScores,
                  pointPlacement: 'on'
                }]

                var dataActiveScores = []
                fts = score["activity"].features;
                for(var i in fts) {
                  var dataft = data[fts[i].feature]
                  if(dataft) { 
                    var y = dataft.score                    
                    dataActiveScores.push({y :y, ori: dataft.raw});
                  } else {
                    dataActiveScores.push(0);
                  }
                  cateActivity.push(fts[i].name)
                }
                
                

                $scope.chartRadarActivityConfig.series= [{
                  type:"area",
                  name: 'Activity Score',
                  data: dataActiveScores,
                  pointPlacement: 'on'
                }]
              

                $scope.chartRadarFDTScoreConfig.series = []; 
          

                var dataFDTScores = []
                $scope.chartRadarFDTScoreConfig.title = {text : "FDT Score: " + data.fdt.score.toFixed(2)};
                $scope.chartSeedSCScoreConfig.title = {text : "FDT Score: " + data.fdt.score.toFixed(2)};
                fts = score["fdt_score"].features;
                for(var i in fts) {
                  var dataft = data[fts[i].feature]
                  if(dataft) {           
                    dataFDTScores.push({y :dataft.score, ori: dataft.raw});
                  } else {
                    dataFDTScores.push(0);
                  }
                  cateFDTScore.push(fts[i].name)
                }
                //seed sc score
                var seedSCScores = [], seedStyles = []
                fts = score["seedsc"]["fdt_score"].features;
                for(var i in fts) {
                  var dataft = data[fts[i].feature]
                  if(dataft) {           
                    seedSCScores.push({y :dataft.score, ori: dataft.raw, weight: dataft.weight});
                  } else {
                    seedSCScores.push(0);
                  }
                  cateSeedSCFDTScore.push(fts[i].name)
                }
                fts = score["seedsc"]["styles"].features;
                for(var i in fts) {
                  var dataft = data[fts[i].feature]
                  if(dataft) {           
                    seedStyles.push({y :dataft.score, ori: dataft.raw, weight: dataft.weight});
                  } else {
                    seedStyles.push(0);
                  }
                  cateSeedStyleScore.push(fts[i].name)
                }

                //$scope.chartRadarFDTScoreConfig.subtitle = {text : "FDT Score: " + data.fdt.score};

                $scope.chartRadarFDTScoreConfig.series =[{
                  type:"area",
                  name: 'FDT Score',
                  data: dataFDTScores,
                  pointPlacement: 'on',

                }]
                //seed sc
                $scope.chartSeedSCScoreConfig.series =[{
                  type:"area",
                  name: 'FDT Score',
                  data: seedSCScores,
                  pointPlacement: 'on',

                }]

                $scope.chartSeedStyleScoreConfig.series =[{
                  type:"area",
                  name: 'Trader Styles',
                  data: seedStyles,
                  pointPlacement: 'on',

                }]
              } 
            
          });
        })
      }
      //if(db == "CN")  
      _loadScore();
      setTimeout(function() {
        window.dispatchEvent(new Event('resize')); // manully trigger redraw of chart
      },100)
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
        text : ($scope.seedsc?"All Time P&L Trend" : "ROI Trend")
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
    // $scope.chartConfig.options.chart.events = {

    //     click: function (event) {
    //         var tDAte = moment(event.xAxis[0].value).format("YYYY-MM-DD");
    //         _filterTradeDate(tDAte)
    //     }
    // }
    $scope.chartValueConfig = {
      options: {
        colors: ["#1ab394","#f8ac59"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x'
        },
        legend: {
          enabled: true
        }
      },
      title :{
        text : "Account & Cash Value Trend"
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
    $scope.chartLoginConfig = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x'
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text : "Login Activities"
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
    }
    $scope.chartTradeCountConfig = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x'
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text : "UR_P&L Trend"
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
    }
    $scope.chartRollPriceConfig = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x'
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text : "Roll Price"
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
    }
    $scope.chartPNLConfig = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x'
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text : ($scope.seedsc? "Daily P&L Efficiency" : "Daily PNL Trend")
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
    }
    $scope.chartCommisionConfig = {
      options: {
        
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x'
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text :  "Daily Commision"
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
    }
    $scope.chartTradesConfig = {
      options: {
        colors: ["#1ab394","#127E68"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x',
          type: 'column',
          // options3d: {
          //   enabled: true,
          //   alpha: 0,
          //   beta: 0,
          //   viewDistance: 25,
          //   depth: 40
          // }
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            depth: 10
          }
        },
        tooltip: {
          headerFormat: '<b>{point.key}</b><br>',
          pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: {point.y} / {point.stackTotal}'
        }
      },
      title :{
        text : "Daily Trades"
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
                text: 'Trades'
            },
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
      }
    }
    $scope.chartRankingConfig = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x',
          type: 'line',
        },
        
      },
      title :{
        text : "Daily Ranking"
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
          reversed: true,
          title: {
              text: 'Trades'
          },
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
      }
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
      text: 'Open Positions',
    },
      //series: $scope.chartSeries
  }
  var cateProfit = [], cateFDTScore = [], cateSeedSCFDTScore = [], cateSeedStyleScore = [], cateRiskCtrl = [], cateRiskPref = [], cateActivity = []
  $scope.chartRadarConfig = {
    options : {
      colors: ["#FDCC99"],
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
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/><span style="color:{series.color}">Origin: <b>{point.ori:,.4f}</b>'
      }
    },

    title: {
      text: '',
    },

    pane: {
      size: '80%'
    },

    xAxis: {
      categories: cateRiskCtrl,
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
      pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.4f}</b><br/>'
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
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.4f}</b><br/><span style="color:{series.color}">Origin: <b>{point.ori:,.4f}</b>'
      }
    },

    title: {
      text: '',
    },

    pane: {
      size: '80%'
    },

    xAxis: {
      categories: cateRiskPref,
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
  $scope.chartRadarActivityConfig = {
    options : {
      colors: ["#D8A8DE"],
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
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.4f}</b><br/><span style="color:{series.color}">Origin: <b>{point.ori:,.4f}</b>'
      }
    },

    title: {
      text: '',
    },

    pane: {
      size: '80%'
    },

    xAxis: {
      categories: cateActivity,
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
      colors: ["#BDDAF7"],
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
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.4f}</b><br/><span style="color:{series.color}">Origin: <b>{point.ori:,.4f}</b>'
      }
    },

    title: {
      text: '',
    },

    pane: {
      size: '80%'
    },

    xAxis: {
      categories: cateProfit,
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
  $scope.chartSeedSCScoreConfig = {
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
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.4f}</b><br/><span style="color:{series.color}">Origin: <b>{point.ori:,.4f}</b><br/><span style="color:{series.color}">Weitht: <b>{point.weight:,.4f}</b>'
      }
    },

    title: {
      text: '',
    },

    pane: {
      size: '80%'
    },

    xAxis: {
      categories: cateSeedSCFDTScore,
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
  $scope.chartSeedStyleScoreConfig = {
    options : {
      colors: ["#D8A8DE"],
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
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.4f}</b><br/><span style="color:{series.color}">Origin: <b>{point.ori:,.4f}</b><br/><span style="color:{series.color}">Weitht: <b>{point.weight:,.4f}</b>'
      }
    },

    title: {
      text: '',
    },

    pane: {
      size: '80%'
    },

    xAxis: {
      categories: cateSeedStyleScore,
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
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.4f}</b><br/>'
      }
    },

    title: {
      text: '',
    },

    pane: {
      size: '80%'
    },

    xAxis: {
      categories: cateFDTScore,
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
  if($stateParams.userID) {
    $scope.loadData();
    $scope.hasUserId = true;
    //$scope.loadProfolioData();
  }
});
