(
  function() {
  'use strict';

  var app = angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
    app.config(config)
    app.run(run)
    app.controller('login', login)
  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];
  login.$inject = ['$scope'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix();
  }

  function run() {
    FastClick.attach(document.body);
  }

  function login($scope) {
    $scope.message = "hello";
    $scope.cookie = $.cookie().team;
    $scope.login = function () {
      $.cookie('team', $scope.team);
      console.log($scope.cookie);
    }
  }



  //
  // app.controller('login', [ '$scope', '$cookies', function ($scope, $cookies) {
  //   $scope.message = "hello";
    // $cookies.put('myFavorite', 'oatmeal');
  // }])

})();
