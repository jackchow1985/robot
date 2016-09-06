'use strict';

angular.module('inspinia')
  .controller('UserScoreCtrl', function ($scope, $rootScope, $http, $q) {
  var tNameMap = {};
  $scope.distShow = false
  $scope.fts = [];
  var rawFTs = ["ft_avg_ngt_op", "ft_std_op_qty", "ft_df_qty", "ft_active_ratio", "ft_var", "ft_trade_cnt", "ft_tmdd", "ft_roll_price", "ft_bgw", "ft_mdd", "ft_bgl", "ft_up", "ft_avg_dr", "ft_std_neg_pnlr", "ft_avg_max_op", "ft_streak", "ft_active_ratio_sldwnd", "ft_win_ratio", "ft_trade_cnt_pday", "ft_tdlf", "ft_login_cnt", "ft_cp_streak", "ft_std_op_dr", "ft_login_cnt_pday", "ft_shp_rt", "ft_tdd"]
  for(var i in rawFTs) {
    constructDistChart(rawFTs[i])
    $scope.fts.push({chartObj : $scope[rawFTs[i]], name : rawFTs[i]})
  }
  function drawChart(url, ft) {
    $http.get(url + "&ft="  + ft.name).success(function(data) {
      var dataArr = [];           
      for(var i = 0; i < data.length; i++) {
        if(data[i]._id != 0)
          dataArr.push([data[i]._id, data[i].count])
      }
      ft.chartObj.series = [];
      ft.chartObj.series =[{
        type:"column",
        name: "# users between this range",
        data : dataArr
      }]
    })
  }
  function getDistData(url) {
    for(var i in $scope.fts) {
      drawChart(url, $scope.fts[i])
    }
  }
  function constructDistChart(ft) {
    $scope[ft] = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x',
          
        },
        tooltip: {
          formatter: function() {
              return this.y + ' # users feature ' + this.x;
          }
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text : ""
      },
      xAxis: {

          title: {
              text: ft + ' Distrubtion'
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
  }
  function getFXGlobalContest() {
    var deferred = $q.defer();
    $http.get("getAllContestByApp?db=TW&app=FX").success(function(data) {      

      for(var i in data) {
        if(data[i].name) {
          tNameMap[data[i].contest_id] =  {
            name : data[i].name , 
            icon_image : data[i].icon_image
          }
        }
      }
      deferred.resolve();
    })
    return deferred.promise;
  }
  function getFTGlobalContest() {
    var deferred = $q.defer();
    $http.get("getAllContestByApp?db=TW&app=FT").success(function(data) {      

      for(var i in data) {
        if(data[i].name) {
          tNameMap[data[i].contest_id] =  {
            name : data[i].name , 
            icon_image : data[i].icon_image
          }
        }
      }
      deferred.resolve();
    })
    return deferred.promise;
  }
  // $http.get("getAllContestByApp?db=TW&app=FT").success(function(data) {      

  //   for(var i in data) {
  //     if(data[i].name) {
  //       tNameMap[data[i].contest_id] =  {
  //         name : data[i].name , 
  //         icon_image : data[i].icon_image
  //       }
  //     }
  //   }
  // })
  function getCNFXContest() {
    var deferred = $q.defer();
    $http.get("getAllContestByApp?db=CN&app=FX").success(function(data) {      

      for(var i in data) {
        if(data[i].name) {
          tNameMap[data[i].contest_id] =  {
            name : data[i].name , 
            icon_image : data[i].icon_image
          }
        }
      }
      deferred.resolve();
    })
    return deferred.promise;
  }
  function getCNFCContest() {
    var deferred = $q.defer();
    $http.get("getAllContestByApp?db=CN&app=FC").success(function(data) {      

      for(var i in data) {
        if(data[i].name) {
          tNameMap[data[i].contest_id] =  {
            name : data[i].name , 
            icon_image : data[i].icon_image
          }
        }
      }
      deferred.resolve();
    })
    return deferred.promise;
  }
  function getCNSCContest() {
    var deferred = $q.defer();
    $http.get("getAllContestByApp?db=CN&app=SC").success(function(data) {      

      for(var i in data) {
        if(data[i].name) {
          tNameMap[data[i].contest_id] =  {
            name : data[i].name , 
            icon_image : data[i].icon_image
          }
        }
      }
      deferred.resolve();
    })
    return deferred.promise;
  }
  $scope.changeFt = function(item) {

    if(item) {
      $scope.contestSelected = item
    }

    if($scope.contestSelected.contestID && $scope.weightSelected == "fsw_sim_default")
      $scope.weightSelected = $scope.weightFiles[1]
    if(!$scope.contestSelected.contestID && ($scope.weightSelected == "fsw_simc_1" || $scope.weightSelected == "fsw_day_trade" || $scope.weightSelected == "fsw_inc_1"))
      $scope.weightSelected = $scope.weightFiles[0]
    if($scope.contestSelected.region == "SEEDSC")
      $scope.weightSelected = "fsw_day_trade"
    if($scope.contestSelected.region == "INC" || $scope.contestSelected.region == "GlobalINC" )
      $scope.weightSelected = "fsw_inc_1"

    $scope.userList = [];
    var reqUrl = "getFDTScoreList?wt_tg=" + $scope.weightSelected + "&sort=" + $scope.featureSelected + "&col=" + $scope.contestSelected.id + "&ap_tag=" + $scope.contestSelected.source + "&region=" + $scope.contestSelected.region + "&limit=" + $scope.limitList + "&desc=" + $scope.sortTypeSelected + ($scope.incubatee ? "&arena=" + "incubatee" : "")
    $scope.downLoadUrl = reqUrl + "&format=csv"
    if($scope.contestSelected.source.indexOf("_sim_all") >= 0 && $scope.contestSelected.id.indexOf("prod") >= 0) { //sim user
      $scope.downLoadUrl = "downloadInc?app=" + $scope.contestSelected.source.replace("_sim_all", "") + "&region=" + ($scope.contestSelected.id.indexOf("global") >=0? "global" : "china") 
    }
    
    $http.get(reqUrl).success(function(data) {
      $scope.userList = data;
      loadUserInfo();
      
      $scope.chartScoreDistConfig.series = [];
      $scope.chartProfDistConfig.series = [];
      $scope.chartRiskDistConfig.series = [];
      $scope.chartActDistConfig.series = [];
      $scope.chartConsiDistConfig.series = [];
      $http.get(reqUrl + "&dist=fdt").success(function(data) {
        var dataArr = [];            
        for(var i = 0; i < data.length; i++) {
          if(data[i]._id != 0)
            dataArr.push([data[i]._id, data[i].count])
        }
        $scope.chartScoreDistConfig.series.push ({
          type:"column",
          name: "# users between this range",
          data : dataArr
        })
      })
      $http.get(reqUrl + "&dist=profitability").success(function(data) {
        var dataArr = [];            
        for(var i = 0; i < data.length; i++) {
          if(data[i]._id != 0)
            dataArr.push([data[i]._id, data[i].count])
        }
        $scope.chartProfDistConfig.series.push ({
          type:"column",
          name: "# users between this range",
          data : dataArr
        })
      })
      $http.get(reqUrl + "&dist=consistency").success(function(data) { 
        var dataArr = [];           
        for(var i = 0; i < data.length; i++) {
          if(data[i]._id != 0)
            dataArr.push([data[i]._id, data[i].count])
        }
        $scope.chartConsiDistConfig.series.push ({
          type:"column",
          name: "# users between this range",
          data : dataArr
        })
      })
      $http.get(reqUrl + "&dist=riskCtrl").success(function(data) { 
        var dataArr = [];           
        for(var i = 0; i < data.length; i++) {
          if(data[i]._id != 0)
            dataArr.push([data[i]._id, data[i].count])
        }
        $scope.chartRiskDistConfig.series.push ({
          type:"column",
          name: "# users between this range",
          data : dataArr
        })
      })
      $http.get(reqUrl + "&dist=activity").success(function(data) {
        var dataArr = [];            
        for(var i = 0; i < data.length; i++) {
          if(data[i]._id != 0)
            dataArr.push([data[i]._id, data[i].count])
        }
        $scope.chartActDistConfig.series.push ({
          type:"column",
          name: "# users between this range",
          data : dataArr
        })
      })
      if($scope.distShow)
        getDistData(reqUrl)
    });
  }
  
  $scope.changeProd = function(item) {    
    $scope.changeFt(item);
  }
  $scope.initProd = function() {
    $scope.contests = [];
    getFTGlobalContest().then(function(){getFXGlobalContest()})
    .then(function(){getCNFXContest()}).then(function(){getCNSCContest()}).then(function(){getCNFCContest()}).then(function() {
      $http.get("queryContestByApp?prod=" + $scope.productSelected).success(function(data) {
        for(var i in data) {
          var item = {
            name: data[i].source + " - " + data[i].col , 
            id : data[i].col, 
            source : data[i].source,
            region : "CN"
          }
          if(data[i].col.indexOf("_test") >= 0) { //skip test
            continue;
          }
          if(data[i].col.indexOf("_inc") >= 0) {
            item.region = "INC"
          }
          if(data[i].col.indexOf("_seed") >= 0) {
            item.region = "SEED"
          }
          if(data[i].col.indexOf("sc_china_seed") >= 0) { //special case for china seed of sc
            item.region = "SEEDSC"
          }
          
          if(data[i].source && data[i].source.indexOf("sim_all") >= 0 ) {
             item.name = "中国" + (data[i].col.indexOf("fx") >= 0 ?"外汇" : (data[i].col.indexOf("fc") >= 0 ? "期货":"股票")) + (data[i].col.indexOf("seed") >= 0 ?"种子" : (data[i].col.indexOf("inc") >= 0 ? "孵化器":"模拟")) + "用户"
          }
          if(data[i].source && data[i].source.indexOf("simc_") >= 0 ) {
            item.contestID = data[i].source.split("simc_")[1]
            if(tNameMap[item.contestID]) {
              item.name = tNameMap[item.contestID]["name"]
              item.icon_image = tNameMap[item.contestID]["icon_image"]
              //item.users = tNameMap[item.contestID]["users"]
            }
          } else {
             item.icon_image = "https://lh3.googleusercontent.com/UYcLH0TfhavUG0BUl_7GtUhOpy8RQlPA1SepFY2v4XLNp3QlXkikOFfIrETmBRPcckQ=w300-rw"
          }
          //console.info($rootScope.roleRegion)
          if(item.region == "INC" && $rootScope.incuShow && ($rootScope.roleRegion == "CN" ||  $rootScope.roleRegion == "All")) 
            $scope.contests.push(item)
          else if( (item.region == "SEED" || item.region == "SEEDSC") && ($rootScope.seedShow || $rootScope.ftShow) && ($rootScope.roleRegion == "CN" ||  $rootScope.roleRegion == "All"))
            $scope.contests.push(item)
          else if(item.region == "CN" && ($rootScope.roleRegion == "CN" || $rootScope.roleRegion == "All")  && $rootScope.simShow )
            $scope.contests.push(item)
        }
        $scope.contestSelected = $scope.contests[0];
        $scope.weightFiles = ["fsw_sim_default", "fsw_simc_1", "fsw_all_tune", "fsw_con_tune", "fsw_day_trade", "fsw_ft_cnsvtv", "fsw_inc_1","fsw_inc_2","fsw_inc_aggrsv","fsw_inc_blnce","fsw_inc_cnsvtv","fsw_inc_shp","fsw_inc_w_op","fsw_inc_w_op_dr"];
        $scope.weightSelected = $scope.weightFiles[0];
        $scope.changeFt();
        //})
      });
      $http.get("queryContestByApp?prod=" + $scope.productSelected + "&region=Global").success(function(data) {
        for(var i in data) {
          var item = {
            name: data[i].source + " - " + data[i].col , 
            id : data[i].col, 
            source : data[i].source,
            region : "Global"
          }
          if(data[i].col.indexOf("ft_global_seed") >= 0) { //special case for china seed of sc
            item.region = "SEEDFT"
          }   
          if(data[i].col.indexOf("_inc") >= 0) {
            item.region = "GlobalINC"
          }       
          if(data[i].source && data[i].source.indexOf("sim_all") >= 0 ) {
             item.name = "全球" + (data[i].col.indexOf("fx") >= 0 ?"外匯" : "台灣期货") + (data[i].col.indexOf("seed") >= 0 ?"种子" : (data[i].col.indexOf("inc") >= 0 ? "孵化器":"模拟")) + "用户"
          }
          if(data[i].col.indexOf("_test") >= 0) { //skip test
            continue;
          }
          if(data[i].source && data[i].source.indexOf("simc_") >= 0 ) {
            item.contestID = data[i].source.split("simc_")[1]
            if(tNameMap[item.contestID]) {
              item.name = tNameMap[item.contestID]["name"]
              item.icon_image = tNameMap[item.contestID]["icon_image"]
              //item.users = tNameMap[item.contestID]["users"]
            }
          } else {
             item.icon_image = "https://avatars0.githubusercontent.com/u/18319956?v=3&s=200"
          }
          if($rootScope.ftShow && data[i].col.indexOf("ft") >=0 && $rootScope.roleRegion != "CN" ) // for tw ft
            $scope.contests.push(item)
          else if(!$rootScope.ftShow && $rootScope.roleRegion != "CN") {
            $scope.contests.push(item) 
          }

        }

        // $scope.contests.sort(function(a, b) {
        //   return b.users - a.users
        // })
      });
    })
  }
  $scope.limitList = 10
  $scope.loginCount = 0
  $scope.tradeCount = 0
  // $scope.products = [{
  //     name : 'China FX',
  //     id : 'fx_sim_all'
  //   },{
  //     name : 'China FC',
  //     id : 'fc_sim_all'
  //   },{
  //     name : 'China SC',
  //     id : 'sc_sim_all'
  //   }];
  // $scope.productSelected = $scope.products[0]
    
  $scope.features = ["fdt", "riskCtrl", "riskPref", "consistency", "activity", "profitability", "ft_bgl", "ft_mdd", "ft_avg_max_op", "ft_avg_nt_op", "ft_std_neg_pnlr", "ft_df_qty", "ft_avg_dr", "ft_avg_max_op", "ft_up" ,"ft_bgw", "ft_std_op_qty", "ft_std_op_dr", "ft_login_cnt", "ft_trade_cnt"];
  $scope.sortTypes = ["Top","Tail", "Random"];
  $scope.usersMap ={}
  $scope.featureSelected = $scope.features[0]
  $scope.sortTypeSelected = $scope.sortTypes[0];
  function loadUserInfo() {
    for(var i = 0 ; i < $scope.userList.length; i++) {
      $http.get("getUserInfo?db=" + $scope.contestSelected.region+"&userID=" + $scope.userList[i].user_id).success(function(data) {
        if(data && data.length > 0) {
          var user = data[0]
          $scope.usersMap[user.USERID] = user
        }
      });
    }
  }
  $scope.chartScoreDistConfig = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x',
          
        },
        tooltip: {
          formatter: function() {
              return this.y + ' # users score ' + this.x;
          }
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text : ""
      },
      xAxis: {

          title: {
              text: 'FDT Score Distrubtion'
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
    $scope.chartProfDistConfig = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x',
          
        },
        tooltip: {
          formatter: function() {
              return this.y + ' # users score ' + this.x;
          }
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text : ""
      },
      xAxis: {

          title: {
              text: 'Profitability Score Distrubtion'
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
    $scope.chartRiskDistConfig = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x',
          
        },
        tooltip: {
          formatter: function() {
              return this.y + ' # users score ' + this.x;
          }
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text : ""
      },
      xAxis: {

          title: {
              text: 'Risk Control Score Distrubtion'
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
    $scope.chartConsiDistConfig = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x',
          
        },
        tooltip: {
          formatter: function() {
              return this.y + ' # users score ' + this.x;
          }
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text : ""
      },
      xAxis: {

          title: {
              text: 'Consistency Score Distrubtion'
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
    $scope.chartActDistConfig = {
      options: {
        colors: ["#1ab394"],
        chart: {
          backgroundColor:'rgba(255, 255, 255, 0.1)',
          zoomType: 'x',
          
        },
        tooltip: {
          formatter: function() {
              return this.y + ' # users score ' + this.x;
          }
        },
        legend: {
          enabled: false
        }
      },
      title :{
        text : ""
      },
      xAxis: {

          title: {
              text: 'Activity Score Distrubtion'
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
 });
