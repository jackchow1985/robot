'use strict';
var app = angular.module('inspinia')


app.controller('MapCtrl', function($scope,$location,$http){
  $scope.data = function(){   
    $http.get("getRegionDist?file=Global_Country_TU").success(function(result) {
      //var result ={"data":{"Global_Country_TU":[{"Country":"TW","Total Users":"37183"},{"Country":"IN","Total Users":"11983"},{"Country":"US","Total Users":"6869"},{"Country":"HK","Total Users":"3339"},{"Country":"GB","Total Users":"1265"},{"Country":"JP","Total Users":"263"},{"Country":"MY","Total Users":"245"},{"Country":"AU","Total Users":"172"},{"Country":"ID","Total Users":"160"},{"Country":"SG","Total Users":"131"},{"Country":"CA","Total Users":"127"},{"Country":"AE","Total Users":"98"},{"Country":"BR","Total Users":"91"},{"Country":"","Total Users":"62"},{"Country":"FR","Total Users":"59"},{"Country":"MO","Total Users":"57"},{"Country":"TH","Total Users":"46"},{"Country":"DE","Total Users":"42"},{"Country":"IT","Total Users":"38"},{"Country":"TR","Total Users":"36"},{"Country":"NZ","Total Users":"35"},{"Country":"ES","Total Users":"32"},{"Country":"SE","Total Users":"27"},{"Country":"ZA","Total Users":"26"},{"Country":"RO","Total Users":"26"},{"Country":"PH","Total Users":"23"},{"Country":"KR","Total Users":"23"},{"Country":"VN","Total Users":"19"},{"Country":"SA","Total Users":"19"},{"Country":"NL","Total Users":"16"},{"Country":"NG","Total Users":"15"},{"Country":"NO","Total Users":"15"},{"Country":"RU","Total Users":"14"},{"Country":"EG","Total Users":"13"},{"Country":"PL","Total Users":"12"},{"Country":"PK","Total Users":"12"},{"Country":"BH","Total Users":"12"},{"Country":"JA","Total Users":"11"},{"Country":"CO","Total Users":"11"},{"Country":"IE","Total Users":"11"},{"Country":"MX","Total Users":"11"},{"Country":"BN","Total Users":"10"},{"Country":"KH","Total Users":"10"},{"Country":"IL","Total Users":"9"},{"Country":"KE","Total Users":"8"},{"Country":"PT","Total Users":"8"},{"Country":"AZ","Total Users":"8"},{"Country":"KW","Total Users":"8"},{"Country":"MU","Total Users":"8"},{"Country":"NP","Total Users":"7"},{"Country":"CH","Total Users":"7"},{"Country":"UA","Total Users":"7"},{"Country":"DK","Total Users":"7"},{"Country":"MA","Total Users":"6"},{"Country":"CY","Total Users":"6"},{"Country":"BE","Total Users":"6"},{"Country":"CZ","Total Users":"6"},{"Country":"VE","Total Users":"6"},{"Country":"QA","Total Users":"5"},{"Country":"BD","Total Users":"5"},{"Country":"IR","Total Users":"5"},{"Country":"KG","Total Users":"5"},{"Country":"AT","Total Users":"5"},{"Country":"GR","Total Users":"4"},{"Country":"JO","Total Users":"4"},{"Country":"LT","Total Users":"4"},{"Country":"TM","Total Users":"4"},{"Country":"IQ","Total Users":"4"},{"Country":"MT","Total Users":"3"},{"Country":"KZ","Total Users":"3"},{"Country":"LK","Total Users":"3"},{"Country":"HR","Total Users":"3"},{"Country":"CS","Total Users":"3"},{"Country":"SK","Total Users":"3"},{"Country":"CL","Total Users":"3"},{"Country":"LV","Total Users":"3"},{"Country":"AL","Total Users":"2"},{"Country":"OM","Total Users":"2"},{"Country":"EC","Total Users":"2"},{"Country":"PA","Total Users":"2"},{"Country":"HU","Total Users":"2"},{"Country":"PR","Total Users":"2"},{"Country":"AR","Total Users":"2"},{"Country":"TT","Total Users":"2"},{"Country":"BG","Total Users":"2"},{"Country":"PG","Total Users":"2"},{"Country":"SR","Total Users":"2"},{"Country":"GH","Total Users":"2"},{"Country":"EE","Total Users":"2"},{"Country":"UY","Total Users":"2"},{"Country":"YE","Total Users":"1"},{"Country":"SN","Total Users":"1"},{"Country":"NE","Total Users":"1"},{"Country":"CM","Total Users":"1"},{"Country":"GT","Total Users":"1"},{"Country":"BB","Total Users":"1"},{"Country":"SC","Total Users":"1"},{"Country":"BZ","Total Users":"1"},{"Country":"BY","Total Users":"1"},{"Country":"CR","Total Users":"1"},{"Country":"GP","Total Users":"1"},{"Country":"FI","Total Users":"1"},{"Country":"MV","Total Users":"1"},{"Country":"RW","Total Users":"1"},{"Country":"MD","Total Users":"1"},{"Country":"TJ","Total Users":"1"},{"Country":"CV","Total Users":"1"},{"Country":"LB","Total Users":"1"},{"Country":"JM","Total Users":"1"},{"Country":"ZW","Total Users":"1"},{"Country":"CF","Total Users":"1"},{"Country":"PY","Total Users":"1"},{"Country":"ZM","Total Users":"1"},{"Country":"GE","Total Users":"1"},{"Country":"AM","Total Users":"1"},{"Country":"UZ","Total Users":"1"},{"Country":"TZ","Total Users":"1"},{"Country":"CI","Total Users":"1"},{"Country":"PE","Total Users":"1"},{"Country":"CD","Total Users":"1"},{"Country":"AF","Total Users":"1"},{"Country":"MM","Total Users":"1"},{"Country":"SI","Total Users":"1"},{"Country":"GU","Total Users":"1"}]}}
      result = result.data["Global_Country_TU"]
      var mapMap = {};
      $scope.markers = [];
      for(var i = 0 ; i < result.length; i++) {
        if(result[i]["Country"])
          mapMap[result[i]["Country"]] = parseInt(result[i]["Total Users"])
        if(result[i]["Country"] == "HK") {
          $scope.markers.push({latLng: [22.15, 114.10], name: 'Hong Kong', values : parseInt(result[i]["Total Users"])})
        }
      }
      $scope.datamap = mapMap
    }) 
  }  
})   

app.directive('map', function() {

    return {
        restrict: 'EAC', 
        link: function(scope, element, attrs) {
          var chart = null;
  
           scope.$watch("datamap" , function(n,o){ 
             console.log(chart)
             if(scope.datamap){
                $(element).width('auto')
                $(element).height(400)
                chart = $(element).vectorMap({
                  onRegionClick: function (e, code) {
                    console.info(code)
                  },
                  map: 'world_mill_en',
                  backgroundColor: "transparent",
                  regionStyle: {
                      initial: {
                          fill: '#e4e4e4',
                          "fill-opacity": 1,
                          stroke: 'none',
                          "stroke-width": 0,
                          "stroke-opacity": 0
                      }
                  },
        					series: {
        						regions: [{
        							values: scope.datamap,  
        							scale: ["#1ab394","#ED5565"],
                      normalizeFunction: 'polynomial'
        						}]
        					},
                  onMarkerTipShow : function(e, el, code) {
                    el.html(el.html()+ ": " + (scope.markers[code]?scope.markers[code].values : ""));
                  },
                  onRegionTipShow: function(e, el, code) {
                    el.html(el.html()+ ": " + (scope.datamap[code]?scope.datamap[code] : ""));
                  },
                  markers: scope.markers, 
                  markerStyle: {
                    initial: {
                      fill: '#F8E23B',
                      stroke: '#383f47'
                    }
                  }
      					
                })
             }
          });              
        }
    }; 
});
