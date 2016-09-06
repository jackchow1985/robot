'use strict';

angular.module('inspinia')
  .controller('ContestCrol', function ($scope, $rootScope, $http) {
    var products = [{
        name : 'FX',
        id : '1'
      },{
        name : 'FC',
        id : '2'
      },{
        name : 'SC',
        id : '3'
    }];
    $scope.$watch(function() {
      return $rootScope.selectedSchool;
    }, function() {
      if($rootScope.selectedSchool) {
        
        if($rootScope.regionSelected == "CN")
          $scope.products = products
        else 
          $scope.products = [products[0]]
        $scope.selected = $scope.products[0];
        $scope.loadContentData($rootScope.selectedSchool)
      }
    }, true);
    
    
    $scope.loadContentData = function(key) {
      $scope.contestList =[];
      $http.get("getContestByApp?school_key=" + key + "&app=" + $scope.selected.name + "&db=" + $rootScope.regionSelected).success(function(data) {
        $scope.contestList = data;
      });
    }

    $scope.changeProduct = function(item) {
      $scope.loadContentData($rootScope.selectedSchool) 
    }

 });
