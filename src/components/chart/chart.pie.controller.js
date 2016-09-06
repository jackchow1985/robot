'use strict';

angular.module('inspinia')
  .controller('ChartPieCtrl', function ($scope, $http, $rootScope) {
    var channelName = {"900":"CPA推广-900市场","all_all":"所有渠道","iphone_all":"iOS所有渠道","android_all":"安卓所有渠道","iphone_APPLE_STORE":"Apple Store","jrtoutiaoq3":"今日头条强下载3","jrtoutiaoq2":"今日头条强下载2","jrtoutiaoq1":"今日头条强下载1","manhua":"漫画","weixintg":"微信推广","zhihuitui5":"智汇推5","zhihuitui4":"智汇推4","zhihuitui3":"智汇推3","zhihuitui2":"智汇推2","zhihuitui1":"智汇推1","Samsung":"三星应用市场","duiba30m":"兑吧30M推广","kuaihu":"CPA推广-快虎市场","yiyou":"CPA推广-易优市场","douguo":"CPA推广-豆果市场","mofang":"CPA推广-魔方应用","zhuoyi":"CPA推广-卓易市场","360zs7":"360手机助手-外部资源","360zs6":"360手机助手-优惠券","360zs5":"360手机助手-其他展示位","360zs4":"360手机助手-活动类","360zs3":"360手机助手-推荐页","360zs2":"360手机助手-软件页","360zs1":"360手机助手-搜索页","360_search":"360手机助手-搜索页","jrtoutiao_page":"今日头条着陆页","jrtoutiao_d":"今日头条强下载","P360":"360推广","zhihuitui":"智汇推","Vivo":"Vivo市场","qitu_52":"奇兔","PP":"PP手机助手","LENOVO":"联想商城","Hui":"惠锁屏","Hongbao":"红包锁屏","duoguo_52":"豆果市场","Dianku":"点酷","jrtoutiao":"今日头条强下载","GOOGLE":"谷歌","test":"测试专用","CN":"FDTCN","WANDO":"豌豆荚","MEIZU":"魅族","A360":"360应用市场","HUAWEI":"华为","MI":"小米","QQ":"应用宝","zhihuitui_a":"智汇推安卓","weixin":"微信","yunmeng":"云盟","DEFAULT":"FDTCN","BAIDU":"百度应用市场"}
    $scope.loadData = function(param) {
      //var dataArr = [{"channel":"APPLE_STORE","count":1797},{"channel":"EN","count":467},{"channel":"TW","count":3833}]
      $http.get("getChannelDist?db=CN").success(function(dataArr) {
        var dataChannels = []
        for(var i in dataArr) {
          dataChannels.push({
            name: channelName[dataArr[i].channel] || dataArr[i].channel , 
            y : Math.abs(dataArr[i].count) 
          })
        }
        $scope.chartPieConfig.series = []
        $scope.chartPieConfig.series.push ({
          type:"pie",
          name: 'China Download Channel Distubution',
          data: dataChannels,
          pointPlacement: 'on'
        })
      })
        
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
          pointFormat: 'Registration:  {point.percentage:.1f} %'
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
    }
  }
        

});
