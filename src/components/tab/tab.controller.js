'use strict';

angular.module('inspinia')
  .controller('TabsDemoCtrl', function ($scope, $rootScope,$window) {
  $scope.tabs = [
    { title:'Global', content:'Dynamic content 1' },
    { title:'China', content:'Dynamic content 2', disabled: true }
  ];

  $scope.actions = ["daily", "weekly", "monthly"];
  $scope.actionSelected = $scope.actions[0]

  $scope.click = function() {
    setTimeout(function() {
      window.dispatchEvent(new Event('resize')); // manully trigger redraw of chart
    },100)
  };
});