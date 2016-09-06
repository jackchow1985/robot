'use strict';

angular.module('inspinia')
  .controller('MT4UserCtrl', function ($scope, $rootScope, $http) {
  $http.get("getMT4Users").success(function(data) {

    $scope.userList = data
    
  });
  
    
 });
