'use strict';

angular.module('inspinia')
  .controller('QtopCrol', function ($rootScope, $scope, $http, $stateParams) {
    $scope.init = function() {

      $http.get("getRiskFeatures?userId=" + $stateParams.userId).success(function(data) {
        $scope.q = data
        $scope.userId =  $stateParams.userId
      })
    }
   
  });
