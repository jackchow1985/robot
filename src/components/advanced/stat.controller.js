'use strict';

angular.module('inspinia')
  .controller('StatCrol', function ($rootScope, $scope, $http, $location, $anchorScroll) {
    $scope.devices = [
      {name :"全部平台", type: "all"},
      {name :"安卓（Android）", type: "android"},
      {name :"苹果（iPhone）", type: "iphone"}
     ]
    $scope.retention = {}
    $scope.selectedRangeType = 'daily'
    $scope.range = {
      "daily" : "天",
      "weekly" : "周",
      "monthly" : "月"
    }
    $scope.retentionMap = {};
    $scope.selectedChannelName = "所有渠道"
    var defalutChart = false;
    var channelNames = [{"channel": "jrtoutiaoq3", "channel_name": "今日头条强下载3"}, {"channel": "jrtoutiaoq2", "channel_name": "今日头条强下载2"}, {"channel": "jrtoutiaoq1", "channel_name": "今日头条强下载1"}, {"channel": "manhua", "channel_name": "漫画"}, {"channel": "weixintg", "channel_name": "微信推广"}, {"channel": "zhihuitui5", "channel_name": "智汇推5"}, {"channel": "zhihuitui4", "channel_name": "智汇推4"}, {"channel": "zhihuitui3", "channel_name": "智汇推3"}, {"channel": "zhihuitui2", "channel_name": "智汇推2"}, {"channel": "zhihuitui1", "channel_name": "智汇推1"}, {"channel": "Samsung", "channel_name": "三星应用市场"}, {"channel": "duiba30m", "channel_name": "兑吧30M推广"}, {"channel": "kuaihu", "channel_name": "CPA推广-快虎市场"}, {"channel": "yiyou", "channel_name": "CPA推广-易优市场"}, {"channel": "douguo", "channel_name": "CPA推广-豆果市场"}, {"channel": 900, "channel_name": "CPA推广-900市场"}, {"channel": "mofang", "channel_name": "CPA推广-魔方应用"}, {"channel": "zhuoyi", "channel_name": "CPA推广-卓易市场"}, {"channel": "360zs7", "channel_name": "360手机助手-外部资源"}, {"channel": "360zs6", "channel_name": "360手机助手-优惠券"}, {"channel": "360zs5", "channel_name": "360手机助手-其他展示位"}, {"channel": "360zs4", "channel_name": "360手机助手-活动类"}, {"channel": "360zs3", "channel_name": "360手机助手-推荐页"}, {"channel": "360zs2", "channel_name": "360手机助手-软件页"}, {"channel": "360zs1", "channel_name": "360手机助手-搜索页"}, {"channel": "360_search", "channel_name": "360手机助手-搜索页"}, {"channel": "jrtoutiao_page", "channel_name": "今日头条着陆页"}, {"channel": "jrtoutiao_d", "channel_name": "今日头条强下载"}, {"channel": "P360", "channel_name": "360推广"}, {"channel": "zhihuitui", "channel_name": "智汇推"}, {"channel": "Vivo", "channel_name": "Vivo市场"}, {"channel": "qitu_52", "channel_name": "奇兔"}, {"channel": "PP", "channel_name": "PP手机助手"}, {"channel": "LENOVO", "channel_name": "联想商城"}, {"channel": "Hui", "channel_name": "惠锁屏"}, {"channel": "Hongbao", "channel_name": "红包锁屏"}, {"channel": "duoguo_52", "channel_name": "豆果市场"}, {"channel": "Dianku", "channel_name": "点酷"}, {"channel": "jrtoutiao", "channel_name": "今日头条强下载"}, {"channel": "GOOGLE", "channel_name": "谷歌"}, {"channel": "test", "channel_name": "测试专用"}, {"channel": "CN", "channel_name": "FDTCN"}, {"channel": "WANDO", "channel_name": "豌豆荚"}, {"channel": "MEIZU", "channel_name": "魅族"}, {"channel": "A360", "channel_name": "360应用市场"}, {"channel": "HUAWEI", "channel_name": "华为"}, {"channel": "MI", "channel_name": "小米"}, {"channel": "QQ", "channel_name": "应用宝"}, {"channel": "zhihuitui_a", "channel_name": "智汇推安卓"}, {"channel": "weixin", "channel_name": "微信"}, {"channel": "yunmeng", "channel_name": "云盟"}, {"channel": "DEFAULT", "channel_name": "FDTCN"}, {"channel": "BAIDU", "channel_name": "百度应用市场"} ]
    $scope.channelName = {"all_all" : "所有渠道", "iphone_all" : "iOS所有渠道", "android_all" : "安卓所有渠道", "iphone_APPLE_STORE": "Apple Store"}
    for(var i in channelNames) {
      $scope.channelName[channelNames[i].channel] = channelNames[i].channel_name
    }
    console.info(JSON.stringify($scope.channelName))
    $scope.actions = [
      {name :"激活用户数", type: "channel_atv_1d"},
      {name :"注册用户数", type: "channel_reg_1d"},
      {name :"转化率", type: "convert_rate"},
      {name :"活跃用户数", type: "channel_login_1d"},
      {name :"活跃老用户", type: "channel_old_login_1d"},
      {name :"交易用户数", type: "channel_trade_1d"},
      {name :"交易率", type: "trade_rate"},
      {name :"比赛用户数", type: "channel_contest_1d"}
    ]

    $scope.compareList = []
    $scope.channels = [{"channel" : "全部渠道", type:"all"}, {"channel":"APPLE_STORE","count":37150}, {"channel":"360zs1","count":142},{"channel":"360zs3","count":25},{"channel":"360zs4","count":1218},{"channel":"360zs5","count":634},{"channel":"360zs6","count":512},{"channel":"900","count":365},{"channel":"A360","count":1979},{"channel":"BAIDU","count":2456},{"channel":"CN","count":1854},{"channel":"Dianku","count":16069},{"channel":"douguo","count":2987},{"channel":"duiba30m","count":1},{"channel":"GETUI","count":1396},{"channel":"GOOGLE","count":388},{"channel":"Hongbao","count":11718},{"channel":"HUAWEI","count":2954},{"channel":"Hui","count":2772},{"channel":"jrtoutiao","count":219},{"channel":"jrtoutiao_page","count":183},{"channel":"kuaihu","count":85},{"channel":"LENOVO","count":46},{"channel":"MEIZU","count":765},{"channel":"MI","count":6589},{"channel":"mofang","count":6},{"channel":"P360","count":3},{"channel":"QQ","count":7489},{"channel":"TUIGUANG1","count":2657},{"channel":"TUIGUANG2","count":4303},{"channel":"TUIGUANG3","count":2921},{"channel":"TUIGUANG4","count":304},{"channel":"Vivo","count":2176},{"channel":"WANDO","count":2829},{"channel":"weixin","count":416},{"channel":"weixintg","count":1},{"channel":"yiyou","count":225},{"channel":"zhihuitui","count":48},{"channel":"zhihuitui1","count":1},{"channel":"zhihuitui2","count":2},{"channel":"zhihuitui3","count":5},{"channel":"zhuoyi","count":479}]
    $scope.deviceSelected = $scope.devices[0]
    $scope.channelSelected = $scope.channels[0]
    $scope.actionSelected = $scope.actions[0]
    $scope.dailyTypes = []
    $scope.non_daily = false ;
    var dailySelectedDate = ""
    //$scope.singleDate = moment();
    $('#datePicker').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true
    },function(start, end, label) {
        $scope.compareList = ["all_all.json"]
        $scope.chartDailyConfig.series = [];
        
        //alert(moment(start).format("YYYY-MM-DD"));
        dailySelectedDate = moment(start).format("YYYY-MM-DD")
        $scope.changeFilter(dailySelectedDate ,function() {
          $scope.loadDailyTrend($scope.compareList[0], false, "daily")
        })
        
        defalutChart = true
    })
    $scope.dateRange =  moment().format("YYYY-MM-DD")
    // $scope.dateRange = { "startDate": moment($rootScope.lastUpdate).subtract(1, 'months'), endDate:  moment($rootScope.lastUpdate) } 
    $scope.init = function() {
      $http.get("getStatFolder?type=daily/").success(function(data) {

        $scope.dateRange =  moment(data[data.length-1]).format("YYYY-MM-DD")
        dailySelectedDate = moment(data[data.length-1]).format("YYYY-MM-DD")
        $scope.compareList.push("all_all.json")
        $scope.changeFilter($scope.dateRange, function() {
          $scope.loadDailyTrend($scope.compareList[0], true, "daily")
        })
        
        
        defalutChart = true
        
      })
    }
    $scope.changeDateType = function(dateType) {
      $scope.selectedRangeType = dateType
      $scope.retention = {}
      $scope.chartDailyConfig.series = [];
      $scope.compareList = ["all_all.json"]
      if(dateType == "weekly") {
        $http.get("getStatFolder?type=weekly/").success(function(data) {
            var dates = []
            for(var i in data) {
              dates.push({
                name : "周报 - " + data[i],
                date : data[i],
                type : "weekly"
              })
            }
            $scope.dailyTypes = dates;
            $scope.dateSelected = $scope.dailyTypes[dates.length -1]
            $scope.changeFilter(null, function() {
              $scope.loadDailyTrend($scope.compareList[0], true, "weekly")
            })

          })
      }
      if(dateType == "monthly") {
        $http.get("getStatFolder?type=monthly/").success(function(data) {
          var dates = []
          for(var i in data) {
            dates.push({
              name : "月报 - " + data[i],
              date : data[i],
              type : "monthly"
            })
          }
          $scope.dailyTypes = dates;
          $scope.dateSelected = $scope.dailyTypes[dates.length -1]
          $scope.changeFilter(null, function() {
              $scope.loadDailyTrend($scope.compareList[0], true, "monthly")
            })
        })
      }
      if(dateType == "daily") {
        $scope.changeFilter($scope.dateRange)
      }
    }
    function loadRetentionData(type, date, channel) {
      console.info("load retention : " + channel)
      var url = "getStatDailyFromFile?file=retention/" 
      if(type == "daily") {
        url += date
      } else {
        url +=  type + "/" + date
      }
      $scope.retentionMap = {};
      $http.get(url).success(function(data) {
        if(data && data.length > 0 ) {
          for(var i in data) {
            data[i]["login_ratio_day_1"] = parseFloat(data[i]["login_ratio_day_1"]).toFixed(3);
            data[i]["login_ratio_day_7"] = parseFloat(data[i]["login_ratio_day_7"]).toFixed(3);
            
            data[i]["login_ratio_day_14"] = parseFloat(data[i]["login_ratio_day_14"]).toFixed(3);
            data[i]["trade_ratio_day_1"] = parseFloat(data[i]["trade_ratio_day_1"]).toFixed(3);
            
            data[i]["avg_weekly_trade_num"] = parseFloat(data[i]["avg_weekly_trade_num"]).toFixed(3);
            
            data[i]["trade_ratio_day_7"] = parseFloat(data[i]["trade_ratio_day_7"]).toFixed(3);
            data[i]["trade_ratio_day_14"] = parseFloat(data[i]["trade_ratio_day_14"]).toFixed(3);
            $scope.retentionMap[data[i].name] = data[i]
          }
          $scope.retention = $scope.retentionMap[channel]
          for(var k in $scope.statList) {
            $scope.statList[k].avg_weekly_trade_num = $scope.retentionMap[$scope.statList[k].name].avg_weekly_trade_num
          }
        }
      })
    }
    $scope.loadDailyTrend = function(channel, reload, datetype) {
      var channelName = $scope.channelName[channel.slice(0,-5).split("_")[1]] || $scope.channelName[channel.slice(0,-5)] || channel.slice(0,-5) 
      if(!reload)
        $scope.selectedChannelName = channelName
      if(defalutChart && !reload) {
        $scope.compareList = []
        $scope.chartDailyConfig.series = [];
        defalutChart = false
      }
      $location.hash('bottom');
      $anchorScroll();
      if(datetype == "daily")
        loadRetentionData("daily", dailySelectedDate, channel)
      else
        loadRetentionData(datetype, $scope.dateSelected.date, channel)
      // var url = "getStatDailyFromFile?file=retention/" + (selectedDateFromDatePicker || dailySelectedDate)
      // var retentionMap = {};
      // $http.get(url).success(function(data) {
      //   if(data && data.length > 0 ) {
      //     for(var i in data) {
      //       data[i]["login_ratio_day_1"] = parseFloat(data[i]["login_ratio_day_1"]).toFixed(3);
      //       data[i]["login_ratio_day_7"] = parseFloat(data[i]["login_ratio_day_7"]).toFixed(3);
            
      //       data[i]["login_ratio_day_14"] = parseFloat(data[i]["login_ratio_day_14"]).toFixed(3);
      //       data[i]["trade_ratio_day_1"] = parseFloat(data[i]["trade_ratio_day_1"]).toFixed(3);
            
      //       data[i]["avg_weekly_trade_num"] = parseFloat(data[i]["avg_weekly_trade_num"]).toFixed(3);
            
      //       data[i]["trade_ratio_day_7"] = parseFloat(data[i]["trade_ratio_day_7"]).toFixed(3);
      //       data[i]["trade_ratio_day_14"] = parseFloat(data[i]["trade_ratio_day_14"]).toFixed(3);
      //       retentionMap[data[i].name] = data[i]
      //     }
      //     $scope.retention = retentionMap[channel]
      //   }
      // })

   
      if($scope.compareList.indexOf(channel) < 0 || reload) {
        if(!reload)
          $scope.compareList.push(channel)
        $http.get("getDailyTrend?file=" + channel).success(function(data) {
          var dailySer = []
          for(var i in data) {
             dailySer.push([i, data[i][$scope.actionSelected.type]])
          }
          dailySer.sort(function(a, b) {
            return Date.parse(a[0]) - Date.parse(b[0])   
          })
         // dailySer = [["2016-06-07", parseInt(Math.random()*50)],["2016-06-08", parseInt(Math.random()*43)],["2016-06-09", parseInt(Math.random()*12)],["2016-06-10", parseInt(Math.random()*100)],["2016-06-11", parseInt(Math.random()*23)]]
          
          $scope.chartDailyConfig.series.push ({
            type: "line",
            name:  channelName,
            data: dailySer,
          })
        })
      }
    }
    $scope.chaneActionType = function() {
      $scope.chartDailyConfig.series = []
      for(var i in $scope.compareList) {
        console.info("reload trend: " + $scope.compareList[i])
        $scope.loadDailyTrend($scope.compareList[i], true, $scope.selectedRangeType)
      }
      // if(defalutChart) {}
    }
    $scope.changeWeeklyMonthly = function() {
      if($scope.selectedRangeType == "weekly") {
        $scope.changeFilter(null, function() {
          $scope.loadDailyTrend($scope.compareList[0], true, "weekly")
        })
      } else {
        $scope.changeFilter(null, function() {
          $scope.loadDailyTrend($scope.compareList[0], true, "monthly")
        })
      }
    }
    $scope.changeFilter = function(dateFromPicker, cb) {
      // $scope.stat = {}
      $scope.statList = []
      var channel =  $scope.channelSelected.type || $scope.channelSelected.channel;
      var type, date;
      if(!$scope.non_daily )  { //daily
        type = "daily"
        date = dateFromPicker
      } else {
        type = $scope.dateSelected.type; 
        date = $scope.dateSelected.date 
      }
      
      var file = "getStatDailyFromFile?file=" + type + "/" + date
      $scope.downLoadUrl = file + "&format=csv";
      $scope.fileName = type + dateFromPicker +".csv"
      $http.get(file).success(function(data) {
        for(var i in data) {
          data[i].channelName = $scope.channelName[data[i].name.slice(0,-5).split("_")[1]] || $scope.channelName[data[i].name.slice(0,-5)] || data[i].name.slice(0,-5)
          data[i].channelName = data[i].channelName + "||" + data[i].name
        }
        $scope.statList = data
        if(cb) cb()
      })

      // $http.get("getStatDataFromFile?file=" + $scope.actionSelected.type).success(function(data) {
      //   $scope.stat = data;
      //   console.info(data)
      // })
    }

    $scope.chartDailyConfig = {
      options: {
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
      
      title :{
        text : ""
      },
      
      credits: {
        enabled: false
      },
    }
    $scope.chartDailyConfig.series = [] ;
  });
