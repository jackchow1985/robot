'use strict';

angular.module('inspinia', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router', 'ui.bootstrap','highcharts-ng', "ui.select","angular-venn", "angularMoment", "smart-table", "ngBootstrap"])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            abstract: true,
            url: "/login",
            templateUrl: "components/login/login.html",
        })       
        .state('index', {
            abstract: true,
            url: "/index",
            templateUrl: "components/common/content.html",
        })
        .state('index.main', {
            url: "/main",
            templateUrl: "app/main/main.html",           
        })
        .state('index.school', {
            url: "/school",
            templateUrl: "components/school/school.html",
            data: { pageTitle: 'School Analytics' }
        })
        .state('index.user', {
            url: "/userScore",
            templateUrl: "components/user/user_score.html",
            data: { pageTitle: 'User Analytics' }
        })
        .state('index.ctp', {
            url: "/ctp",
            templateUrl: "components/ctp/ctp_overview.html",
            data: { pageTitle: 'User Analytics' }
        })
        .state('index.risk', {
            url: "/risk/:userId",
            templateUrl: "components/advanced/quantopian.html",
            data: { pageTitle: 'quantopian' }
        })
        .state('index.profile', {
            url: "/profile/:userID/:region/:app",
            templateUrl: "components/user/user_profile.html",
            data: { pageTitle: 'User Profile' }
        })
        .state('index.search', {
            url: "/profileSearch",
            templateUrl: "components/user/user_profile.html",
            data: { pageTitle: 'User Profile' }
        })
        .state('index.incu', {
            url: "/incubatee",
            templateUrl: "components/incu/user_list.html",
            data: { pageTitle: 'User List' }
        })
        .state('index.seed', {
            url: "/seed",
            templateUrl: "components/seed/user_list.html",
            data: { pageTitle: 'Seed' }
        })
        .state('index.cmb', {
            url: "/cmb",
            templateUrl: "components/user/cmb_score.html",
            data: { pageTitle: 'cmb' }
        })
        .state('index.stock', {
            url: "/stock",
            templateUrl: "components/stock/predict.html",
            data: { pageTitle: 'stock' }
        })
        .state('index.core', {
            url: "/core",
            templateUrl: "components/user/core_user.html",
            data: { pageTitle: 'core' }
        })
        .state('index.stats', {
            url: "/stats",
            templateUrl: "components/advanced/stat.html",
            data: { pageTitle: 'stats' }
        })
        .state('index.beta', {
            url: "/profile/:userID/:region/:app/:beta",
            templateUrl: "components/user/user_profile.html",
            data: { pageTitle: 'User Profile Beta' }
        })
        .state('index.mt4', {
            url: "/mt4/:accountID",
            templateUrl: "components/user/mt4_profile.html",
            data: { pageTitle: 'MT4 Profile Beta' }
        })
        .state('index.mt4users', {
            url: "/mt4users",
            templateUrl: "components/user/mt4_user.html",
            data: { pageTitle: 'MT4 users' }
        })
        .state('index.quant', {
            url: "/quant",
            templateUrl: "components/school/quant.html",
            data: { pageTitle: 'User Profile Beta' }
        })

    $urlRouterProvider.otherwise('/index/main');

  }).run(function($http, $rootScope) { // instance-injector
   // login landing
    $http.get("getSession").success(function(session) {   
        var role = session.role ;
        $rootScope.roleRegion = session.region;
        $rootScope.roleSchool = session.school;
        $rootScope.userNick = session.nick;
        $rootScope.ftShow = session.ftShow;
        $rootScope.token = session.token;
        if(role && !session.core) {
            role = role.toString().split("");
            $rootScope.dashboardShow = (role[0] == "1"? true:false);
            if(!$rootScope.firstAvailablePage && $rootScope.dashboardShow)
                $rootScope.firstAvailablePage = "#/index/main"
            $rootScope.schoolShow = (role[1]  == "1"? true:false);
            if(!$rootScope.firstAvailablePage && $rootScope.schoolShow)
                $rootScope.firstAvailablePage = "#/index/school"
            $rootScope.incuShow = (role[2]  == "1"? true:false);
            if(!$rootScope.firstAvailablePage && $rootScope.incuShow)
                $rootScope.firstAvailablePage = "#/index/stats"
            $rootScope.seedShow = (role[3]  == "1"? true:false);
            if(!$rootScope.firstAvailablePage && $rootScope.seedShow)
                $rootScope.firstAvailablePage = "#/index/seed"
            $rootScope.simShow = (role[4]  == "1"? true:false);
            if(!$rootScope.firstAvailablePage && $rootScope.simShow)
                $rootScope.firstAvailablePage = "#/index/profileSearch"
            $rootScope.exportShow = (role[5]  == "1"? true:false);
            if(location.hash == "#/index/main") { 
                if($rootScope.firstAvailablePage)              
                    location.href = $rootScope.firstAvailablePage;
                else if(session.ftShow) {
                    location.href = "#/index/userScore"
                } else {
                    location.href = "upload.html";
                }
            } else {
                // do something, when the user modify the url 
            }
        } else {
            $rootScope.simShow = true;
            location.href = "#/index/profile/" + session.username +"/" + session.region + "/" + session.app
        }
        // init global setting
        Highcharts.setOptions({
          global: {
            useUTC: false
          }
        });
    });        
    
     
  });

