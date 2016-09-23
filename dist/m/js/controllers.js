angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Speaks,$interval) {
  $scope.data = {
    levelvalue: 4,
  }
  $scope.changeLevel = function() {
    console.log('range value has changed to :'+$scope.data.levelvalue);
    _drawPieChart($scope.data.levelvalue)

  }
})

.controller('ReturnHistCtrl', function($scope, Speaks) {
  })

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
