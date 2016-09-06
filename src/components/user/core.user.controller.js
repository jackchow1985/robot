'use strict';

angular.module('inspinia')
  .controller('CoreUserCtrl', function ($scope, $rootScope, $http) {
  var schoolTW = [{"name":"台灣大學","key":501,"region":"TW"},{"name":"政治大學","key":502,"region":"TW"},{"name":"清華大學","key":505,"region":"TW"},{"name":"中山大學","key":508,"region":"TW"},{"name":"台灣師範大學","key":506,"region":"TW"},{"name":"中央大學","key":507,"region":"TW"},{"name":"交通大學","key":503,"region":"TW"},{"name":"中興大學","key":520,"region":"TW"},{"name":"輔仁大學","key":511,"region":"TW"},{"name":"東吳大學","key":518,"region":"TW"},{"name":"淡江大學","key":509,"region":"TW"},{"name":"東海大學","key":514,"region":"TW"},{"name":"逢甲大學","key":529,"region":"TW"},{"name":"實踐大學","key":566,"region":"TW"},{"name":"台北商業大學","key":538,"region":"TW"},{"name":"中正","key":513,"region":"TW"},{"name":"暨南大學","key":516,"region":"TW"},{"name":"銘傳大學","key":517,"region":"TW"}]
  var schoolChina = [{"name":"北京大学","key":82,"region":"CN"},{"name":"清华大学","key":129,"region":"CN"},{"name":"人民大学","key":73,"region":"CN"},{"name":"北京师范大学","key":104,"region":"CN"},{"name":"北京航空航天大学","key":78,"region":"CN"},{"name":"对外贸易大学","key":77,"region":"CN"},{"name":"中央财经大学","key":50,"region":"CN"},{"name":"南开大学","key":"IN0102","region":"CN"},{"name":"上海交通大学","key":"IN0061","region":"CN"},{"name":"复旦大学","key":202,"region":"CN"},{"name":"上海财经大学","key":208,"region":"CN"},{"name":"南京大学","key":201,"region":"CN"},{"name":"浙江大学","key":231,"region":"CN"},{"name":"中山大学","key":205,"region":"CN"},{"name":"西南财经大学","key":228,"region":"CN"},{"name":"武汉大学","key":601,"region":"CN"}]
  $scope.appTypes = ["FX","FC", "SC"]
  $scope.regions = ["TW", "IN", "CN", "US", "AU", "HK", "GB", "KE", "ID", "SG", "PK", "NZ", "TR", "CO", "GR", "FR", "SE", "PT", "CZ", "JP", "CA", "RU", "MO", "NO", "IE", "MY", "BR", "ZA", "VE", "AE", "IQ", "KZ", "NP", "UA", "HR", "GH", "NG", "AT", "VN", "EG", "MC", "IT", "BE", "KR", "AZ", "DE", "AF", "LT", "KH", "PH", "SA", "ES", "ME", "IL", "KW", "NL", "PL", "RO", "AM", "BT", "KG", "YE", "JA", "TH", "AR", "BD", "MX", "NI", "SY", "SR", "ZW", "null", "SD", "BN", "IO", "LR"]
  $scope.appSelected = $scope.appTypes[0]
  $scope.regionSelected = $scope.regions[0]

  $scope.limitList = 20;
  $scope.usersMap = {}
  $scope.active = 30;

    $scope.setActive = function(type) {
        $scope.active = type;
    };
    $scope.isActive = function(type) {
        return type === $scope.active;
    };
  function loadUserInfo() {
    for(var i = 0 ; i < $scope.userList.length; i++) {
      $http.get("getUserInfo?app=" + $scope.appSelected + "&db=" + $scope.regionSelected + "&userID=" + $scope.userList[i].user_id).success(function(data) {
        if(data && data.length > 0) {
          var user = data[0]
          $scope.usersMap[user.USERID] = user
        }
      });
    }
  }
  $scope.changeRegion = function() {
    if($scope.regionSelected == "TW") {
      $scope.schools = schoolTW

    } else if ($scope.regionSelected == "CN") {
      $scope.schools = schoolChina
    } 
    $scope.schools.unshift({"name":"All","key":"all","region":"All"})
    
    $scope.schoolSelected = $scope.schools[0]
    $scope.changeSelect();
  }

  $scope.changeSelect = function(days) {
    if(days) {
      $scope.active = days
    }
    $scope.userList = [];
    $scope.totalUser = 0;
    $http.get("getCoreUserBySchool?app=" + $scope.appSelected + "&db=" + $scope.regionSelected + "&school_key=" + ($scope.schoolSelected?$scope.schoolSelected.key:"all") ).success(function(data) {
      var filteredArr = []
      for(var i in data) {
        if(data[i].life >= $scope.active) {
          filteredArr.push(data[i])
        }
      }
      $scope.totalUser = filteredArr.length;
      $scope.userList = filteredArr.slice(0, $scope.limitList);
      loadUserInfo();
    });
  }
    
 });
