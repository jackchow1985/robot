'use strict';

angular.module('inspinia')
  .controller('SchoolCtrl', function ($scope, $rootScope, $http) {
    $scope.regions = [];
    $scope.schoolsList = [];
    var schoolKeys = []
    $scope.schools = [];
    $scope.school = {};
    $scope.compareList = []
    //var data = [{"school_name":"國立臺灣大學","school_key":"501","school_region":"TW"},{"school_name":null,"school_key":null,"school_region":null},{"school_name":"mysore university","school_key":"INOTHER","school_region":"IN"},{"school_name":"哈尔滨商业大学","school_key":"824","school_region":"CN"},{"school_name":"铭传大学","school_key":"517","school_region":"TW"},{"school_name":"玄奘大學","school_key":"578","school_region":"TW"},{"school_name":"國立台灣藝術大學","school_key":"543","school_region":"TW"},{"school_name":"實踐大學","school_key":"566","school_region":"TW"},{"school_name":"National Central University","school_key":"507","school_region":"TW"},{"school_name":"健行科技大學","school_key":"595","school_region":"TW"}]
    function loadSchool (db) {
      $http.get("getSchools?db=" + db).success(function(data) {
        for(var i in data) {
          if(data[i].school_name) {
            if(data[i].school_region && $scope.regions.indexOf(data[i].school_region) < 0 ) {
              if($rootScope.roleRegion == data[i].school_region || $rootScope.roleRegion == "All" ||
               ($rootScope.roleRegion == "Overseas" && data[i].school_region != "CN") ) 
                $scope.regions.push(data[i].school_region)
            }
            if(schoolKeys.indexOf(data[i].school_key) < 0 && data[i].school_key != "INOTHER" && data[i].school_key != "825" && data[i].school_key != "672") {//hiding share shcool key
              if(db == "CN" && data[i].school_region != "CN")
                continue; 
                if(data[i].school_key == $rootScope.roleSchool || $rootScope.roleSchool == "All") {
                  $scope.schoolsList.push(data[i])
                  schoolKeys.push(data[i].school_key)
                }
                
            }
          }
        }
        console.info($scope.regions)
      });
    }
    loadSchool();
    loadSchool("CN")
    $scope.addSchool = function() {
      $scope.school.selected = "Please select a school to compare ..."
      $scope.isCompard = true;
    }
    $scope.loadSchoolData = function(item) {
      //var data = [{"date":"2014-08-29T16:00:00.000Z","daily_user_num":1,"total_user_num":1},{"date":"2014-08-31T16:00:00.000Z","daily_user_num":1,"total_user_num":2},{"date":"2015-01-05T16:00:00.000Z","daily_user_num":1,"total_user_num":3},{"date":"2015-01-07T16:00:00.000Z","daily_user_num":1,"total_user_num":4},{"date":"2015-01-08T16:00:00.000Z","daily_user_num":1,"total_user_num":5},{"date":"2015-01-14T16:00:00.000Z","daily_user_num":1,"total_user_num":6},{"date":"2015-01-17T16:00:00.000Z","daily_user_num":2,"total_user_num":8},{"date":"2015-01-28T16:00:00.000Z","daily_user_num":1,"total_user_num":9},{"date":"2015-02-01T16:00:00.000Z","daily_user_num":9,"total_user_num":18},{"date":"2015-02-02T16:00:00.000Z","daily_user_num":7,"total_user_num":25},{"date":"2015-02-03T16:00:00.000Z","daily_user_num":2,"total_user_num":27},{"date":"2015-02-04T16:00:00.000Z","daily_user_num":2,"total_user_num":29},{"date":"2015-02-05T16:00:00.000Z","daily_user_num":1,"total_user_num":30},{"date":"2015-02-06T16:00:00.000Z","daily_user_num":1,"total_user_num":31},{"date":"2015-02-10T16:00:00.000Z","daily_user_num":1,"total_user_num":32},{"date":"2015-03-01T16:00:00.000Z","daily_user_num":5,"total_user_num":37},{"date":"2015-03-02T16:00:00.000Z","daily_user_num":2,"total_user_num":39},{"date":"2015-03-03T16:00:00.000Z","daily_user_num":2,"total_user_num":41},{"date":"2015-03-04T16:00:00.000Z","daily_user_num":4,"total_user_num":45},{"date":"2015-03-05T16:00:00.000Z","daily_user_num":6,"total_user_num":51},{"date":"2015-03-06T16:00:00.000Z","daily_user_num":1,"total_user_num":52},{"date":"2015-03-07T16:00:00.000Z","daily_user_num":1,"total_user_num":53},{"date":"2015-03-08T16:00:00.000Z","daily_user_num":3,"total_user_num":56},{"date":"2015-03-10T16:00:00.000Z","daily_user_num":5,"total_user_num":61},{"date":"2015-03-11T16:00:00.000Z","daily_user_num":1,"total_user_num":62},{"date":"2015-03-13T16:00:00.000Z","daily_user_num":2,"total_user_num":64},{"date":"2015-03-14T16:00:00.000Z","daily_user_num":14,"total_user_num":78},{"date":"2015-03-15T16:00:00.000Z","daily_user_num":2,"total_user_num":80},{"date":"2015-03-16T16:00:00.000Z","daily_user_num":7,"total_user_num":87},{"date":"2015-03-18T16:00:00.000Z","daily_user_num":2,"total_user_num":89},{"date":"2015-03-19T16:00:00.000Z","daily_user_num":1,"total_user_num":90},{"date":"2015-03-25T16:00:00.000Z","daily_user_num":1,"total_user_num":91},{"date":"2015-04-01T16:00:00.000Z","daily_user_num":1,"total_user_num":92},{"date":"2015-04-08T16:00:00.000Z","daily_user_num":3,"total_user_num":95},{"date":"2015-04-09T16:00:00.000Z","daily_user_num":2,"total_user_num":97},{"date":"2015-04-12T16:00:00.000Z","daily_user_num":1,"total_user_num":98},{"date":"2015-04-29T16:00:00.000Z","daily_user_num":1,"total_user_num":99},{"date":"2015-05-06T16:00:00.000Z","daily_user_num":1,"total_user_num":100},{"date":"2015-05-10T16:00:00.000Z","daily_user_num":1,"total_user_num":101},{"date":"2015-05-14T16:00:00.000Z","daily_user_num":1,"total_user_num":102},{"date":"2015-05-18T16:00:00.000Z","daily_user_num":2,"total_user_num":104},{"date":"2015-05-29T16:00:00.000Z","daily_user_num":1,"total_user_num":105},{"date":"2015-06-09T16:00:00.000Z","daily_user_num":1,"total_user_num":106},{"date":"2015-06-11T16:00:00.000Z","daily_user_num":1,"total_user_num":107},{"date":"2015-06-13T16:00:00.000Z","daily_user_num":1,"total_user_num":108},{"date":"2015-06-15T16:00:00.000Z","daily_user_num":1,"total_user_num":109},{"date":"2015-06-26T16:00:00.000Z","daily_user_num":3,"total_user_num":112},{"date":"2015-07-09T16:00:00.000Z","daily_user_num":1,"total_user_num":113},{"date":"2015-08-01T16:00:00.000Z","daily_user_num":1,"total_user_num":114},{"date":"2015-08-02T16:00:00.000Z","daily_user_num":1,"total_user_num":115},{"date":"2015-08-04T16:00:00.000Z","daily_user_num":1,"total_user_num":116},{"date":"2015-08-05T16:00:00.000Z","daily_user_num":1,"total_user_num":117},{"date":"2015-08-06T16:00:00.000Z","daily_user_num":1,"total_user_num":118},{"date":"2015-08-15T16:00:00.000Z","daily_user_num":1,"total_user_num":119},{"date":"2015-08-20T16:00:00.000Z","daily_user_num":2,"total_user_num":121},{"date":"2015-08-23T16:00:00.000Z","daily_user_num":1,"total_user_num":122},{"date":"2015-08-25T16:00:00.000Z","daily_user_num":1,"total_user_num":123},{"date":"2015-09-06T16:00:00.000Z","daily_user_num":1,"total_user_num":124},{"date":"2015-09-11T16:00:00.000Z","daily_user_num":1,"total_user_num":125}]
      $http.get("getSchoolUserGrowth?school_key=" + item.school_key + "&db=" + item.school_region).success(function(data) {
        if(!$scope.isCompard)
          $scope.chartConfig.series = [];
        var dataArr = []       
        for(var i = 0 ; i < data.length; i ++) {
          dataArr.push([Date.parse(data[i].date), data[i].total_user_num])
        }
        $scope.chartConfig.series.push ({
          type:"spline",
          name: item.school_name,
          data: dataArr
        })
      });
      
    }

    $scope.onSearch = function(item) {

    }

    $scope.loadCountData = function(item) {
      _clearData();
      //load FX
      $http.get("getSchoolUserCountByApp?app=FX&school_key=" + item.school_key + "&db=" + item.school_region).success(function(data) {
        var obj = data;
        $scope.totalUser = obj.totalUser;
        $scope.monthUserFX = obj.monthlyActiveUser;
        $scope.weekUserFX = obj.weeklyActiveUser;
        
      });
      if(item.school_region == "CN") {
        $scope.isChina = true
        //load SC
        $http.get("getSchoolUserCountByApp?app=SC&school_key=" + item.school_key + "&db=" + item.school_region).success(function(data) {
          var obj = data;
          $scope.monthUserSC = obj.monthlyActiveUser;
          $scope.weekUserSC = obj.weeklyActiveUser;
          
        });
        //load FC
        $http.get("getSchoolUserCountByApp?app=FC&school_key=" + item.school_key + "&db=" + item.school_region).success(function(data) {
          var obj = data;
          $scope.totalUser = obj.totalUser;
          $scope.monthUserFC = obj.monthlyActiveUser;
          $scope.weekUserFC = obj.weeklyActiveUser;
          
        });
        
        $http.get("getCoreUserBySchool?app=FC&school_key=" + item.school_key + "&db=" + item.school_region).success(function(data) {
          var count30 = 0, count60 = 0, count90 = 0;
          for(var i in data ) {
            if(data[i]["life"] >30 ) {
              count30 ++;
            } 
            if(data[i]["life"] >60 ) {
              count60 ++
            }
            if(data[i]["life"] > 90){
              count90 ++;
            }
          }
          $scope.coreFC30 = count30;
          $scope.coreFC60 = count60;
          $scope.coreFC90 = count90;
          
          
        });
        
        $http.get("getCoreUserBySchool?app=FX&school_key=" + item.school_key + "&db=" + item.school_region).success(function(data) {
          var count30 = 0, count60 = 0, count90 = 0;
          for(var i in data ) {
            if(data[i]["life"] >30 ) {
              count30 ++;
            } 
            if(data[i]["life"] >60 ) {
              count60 ++
            }
            if(data[i]["life"] > 90){
              count90 ++;
            }
          }
          $scope.coreFX30 = count30;
          $scope.coreFX60 = count60;
          $scope.coreFX90 = count90;
          
        });
        
        $http.get("getCoreUserBySchool?app=SC&school_key=" + item.school_key + "&db=" + item.school_region).success(function(data) {
          var count30 = 0, count60 = 0, count90 = 0;
          for(var i in data ) {
            if(data[i]["life"] >30 ) {
              count30 ++;
            } 
            if(data[i]["life"] >60 ) {
              count60 ++
            }
            if(data[i]["life"] > 90){
              count90 ++;
            }
          }
          $scope.coreSC30 = count30;
          $scope.coreSC60 = count60;
          $scope.coreSC90 = count90;
          
        });
        // $scope.core30 = $scope.coreFX30 + $scope.coreSC30 + $scope.coreFC30
        // $scope.core60 = $scope.coreFX60 + $scope.coreSC60 + $scope.coreFC60
        // $scope.core90 = $scope.coreFX90 + $scope.coreSC90 + $scope.coreFC90

      } else {
        $scope.isChina = false;
        $http.get("getCoreUserBySchool?app=FX&school_key=" + item.school_key + "&db=" + item.school_region).success(function(data) {
          var count30 = 0, count60 = 0, count90 = 0;
          for(var i in data ) {
            if(data[i]["life"] >30 ) {
              count30 ++;
            } 
            if(data[i]["life"] >60 ) {
              count60 ++
            }
            if(data[i]["life"] > 90){
              count90 ++;
            }
          }
          $scope.core30 = count30;
          $scope.core60 = count60;
          $scope.core90 = count90;         
        });
      }
    }
  	 
  	$scope.onSchoolSelect = function(item, model) {
  		//console.info(item)
      $scope.count_show = true;
  		$scope.loadSchoolData(item)
      $scope.loadCountData(item)
      $rootScope.selectedSchool = item.school_key
  	}

    function _clearData() {
      $scope.totalUser = 0;
      $scope.monthUserFX = 0;
      $scope.weekUserFX = 0;
      $scope.monthUserFC = 0;
      $scope.weekUserFC = 0;
      $scope.monthUserSC = 0;
      $scope.weekUserSC = 0;      
      $scope.school.selected = undefined;
      $scope.core30 = 0;
      $scope.core60 = 0;
      $scope.core90 = 0;
      $scope.coreFC30 = 0
      $scope.coreFX30 = 0
      $scope.coreSC30 = 0
      $scope.coreFC60 = 0
      $scope.coreFX60 = 0
      $scope.coreSC60 = 0
      $scope.coreFC90 = 0
      $scope.coreFX90 = 0
      $scope.coreSC90 = 0
    }

    $scope.onRegionSelect = function(item, model) { // on region selected, can load school by region
      //console.info(item)
      _clearData();
      $scope.schools = [];
      $rootScope.regionSelected = item; 
      $scope.school_show = true;  
      if($scope.schoolsList.length > 0) {
        if($rootScope.roleSchool == "All") {
          $scope.schools.push({school_key: "all", school_name: "All schools"})
        }
        for(var i in $scope.schoolsList) {
          if($scope.schoolsList[i].school_region && $scope.schoolsList[i].school_region == item) {
            $scope.schools.push($scope.schoolsList[i]);
             $scope.schools[0]["school_region"] = $scope.schoolsList[i].school_region
          }
        }
      }

    }
    $scope.chartConfig = {
      chart: {
        backgroundColor: null,
          zoomType: 'x'
      },
      title :{
        text : "User Growth"
      },
      // options: {
      //   chart : {
      //     type : "area"
      //   }
      // },
      xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: { // don't display the dummy year
              month: '%b. %e',
              year: '%b'
          },
    
            title: {
                text: 'Date'
            }
        },
        yAxis: {
            title: {
                text: 'Users'
            },
            min: 0
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%e. %b}: {point.y:.f} users'
        },
      legend: {
          enabled: true
      },
      plotOptions: {
          area: {
              color: '#0038ff',
              marker: {
                  enabled: null
              },
              lineWidth: 1,
              states: {
                  hover: {
                      lineWidth: 1
                  }
              },
              threshold: null
          }
      },
      credits: {
        enabled: false
      },
      series: $scope.chartSeries
    }
  	

        

 });
