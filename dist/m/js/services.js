angular.module('starter.services', [])

.factory('Speaks', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var speaks = [{
    id: 0,
    name: 'QD老师',
    lastText: '为什么还不止损!!!?, 关于止损请看：',
    face: 'img/ben.png',
    url : '#',
    title : 'GD老师教你如何控制风险'
  }, {
    id: 1,
    name: 'Prof CC',
    lastText: '你还相信反弹吗？',
    face: 'img/max.png',
    url : '#',
    title : 'Prof CC谈反弹'
  }];

  return {
    all: function() {
      return speaks;
    },
    remove: function(chat) {
      speaks.splice(speaks.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < speaks.length; i++) {
        if (speaks[i].id === parseInt(chatId)) {
          return speaks[i];
        }
      }
      return null;
    }
  };
});


