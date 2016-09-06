'use strict';

angular.module('inspinia')
  .controller('BoxCtrl', function ($scope, $http, $rootScope, $filter, $cookieStore) {
    $rootScope.lastUpdate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    var previousDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
      //$scope.totalUsers = $rootscope.totalUsers
    $scope.loadContestCount = function() {
      $http.get("getContestCount").success(function(data) {
        $scope.contentCount = data[0].count;
      })
      $http.get("getStatFromFile?date="+ $rootScope.lastUpdate + "&oldDate=" + previousDate).success(function(data) {
        $scope.stats = data;
      })
      $http.get("getCoreUserTotal?app=FX&db=TW").success(function(data) {
        $scope.cuGlobal = data.length;
      })
      $http.get("getCoreUserTotal?app=FX&db=CN").success(function(dataFx) {
        $scope.cuChinaFX = dataFx.length;
      })
      $http.get("getCoreUserTotal?app=FC&db=CN").success(function(dataFc) {
        $scope.cuChinaFC = dataFc.length;
      })
      $http.get("getCoreUserTotal?app=SC&db=CN").success(function(dataSc) {
        $scope.cuChinaSC = dataSc.length;
      })
      
    }

    $rootScope.logout = function() {
      $cookieStore.remove("connect.sid");
      location.href = "logout"
    }
    
  });
