'use strict';

angular.module('inspinia')
  .controller('UserRankingCrol', function ($scope, $rootScope, $http) {
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
    //$scope.rankListLoaded = false;
    var usersList = [];
    $scope.$watch(function() {
      return $rootScope.selectedSchool;
    }, function() {
      if($rootScope.selectedSchool) {
        
        if($rootScope.regionSelected == "CN")
          $scope.products = products
        else 
          $scope.products = [products[0]]
        $scope.selected = $scope.products[0];
        $scope.loadSchoolData($rootScope.selectedSchool)
      }
    }, true);
    
    
    $scope.loadSchoolData = function(key) {
      $scope.loaded = false;
      $scope.userRankList = [];
      $scope.rankListLoading = true;
      $http.get("getUserRanking?school_key=" + key + "&app=" + $scope.selected.name + "&db=" + $rootScope.regionSelected).success(function(data) {
        usersList = data;
        $scope.rankListLoading = false;
        $scope.userRankList = data.slice(0,10);
      });
    }

    $scope.loadMore = function() {
      $scope.userRankList = usersList
    }

    $scope.changeProduct = function(item) {
      $scope.loadSchoolData($rootScope.selectedSchool) 
    }

 });
