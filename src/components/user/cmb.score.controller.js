'use strict';

angular.module('inspinia')
  .controller('CMBCtrl', function ($scope, $rootScope, $http) {
  $scope.changeFt = function() {
    var desc = $scope.sortTypeSelected == "Top" ? true : false;
    var random = $scope.sortTypeSelected == "Random"? true : false;
    
    $http.get("getFinlinkList?type=" + $scope.featureSelected.key + "&desc=" + desc + (random?"&random=true":"") + "&limit=" + $scope.limitList + "&logincnt=" + $scope.loginCount + "&tradecnt=" + $scope.tradeCount+ "&unitPrice=" + $scope.unitPrice + "&mdd=" + $scope.mdd ).success(function(data) {
      $scope.userList = data;
      loadUserInfo();
    });
  }
  $scope.limitList = 10
  $scope.loginCount = 0
  $scope.tradeCount = 0
  $scope.unitPrice = 0.95
  $scope.mdd = -0.15
  $scope.features = [{key:"banker_trader_steady", name:"稳健交易型"}, 
    {key:"banker_trader_active", name:"积极交易型"}, 
    {key:"banker_trader_balanced", name:"平衡交易型"}, 
    {key:"banker_investor_steady", name:"稳健投资型"}, 
    {key:"banker_investor_active", name:"积极投资型"}, 
    {key:"banker_investor_balanced", name:"平衡投资型"}, 
    {key:"banker_risk_control", name:"风险控制型"}, 
    {key:"banker_marketing", name:"市场营销型"}];
  $scope.sortTypes = ["Top","Tail", "Random"]
  $scope.usersMap ={}
  $scope.featureSelected = $scope.features[0]
  $scope.sortTypeSelected = $scope.sortTypes[0];
  function loadUserInfo() {
    for(var i = 0 ; i < $scope.userList.length; i++) {
      $http.get("getUserInfo?app=FC&db=CN&userID=" + $scope.userList[i].userId).success(function(data) {
        if(data && data.length > 0) {
          var user = data[0]
          $scope.usersMap[user.USERID] = user
        }
      });
    }
  }

 });
