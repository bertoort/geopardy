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

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }

  function login($scope) {
    $scope.message = "hello";
  }

  // app.controller('login', [ '$scope', function ($scope) {
  //   $scope.message = "hello";
  // }])

})();
