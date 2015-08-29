(
  function() {
  'use strict';

  var app = angular.module('application', [
    'ui.router',
    'ngAnimate',
    'firebase',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
    app.config(config)``
    app.run(run)
    app.controller('login', login)
    app.controller('header', header)
    app.controller('trivia', trivia)
  ;

  app.factory('cookie', function () {
    var cookie;

    var obj = {
      cookie: function () {
        return cookie
      },
      addCookie: function (ck) {
        cookie = ck;
      }
    }

    return obj
  })

  config.$inject = ['$urlRouterProvider', '$locationProvider'];
  login.$inject = ['$scope', 'cookie', '$firebaseArray'];
  header.$inject = ['$scope', 'cookie'];
  trivia.$inject = ['$scope', 'cookie', '$firebaseArray'];

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

  function login($scope, Cookie, $firebaseArray) {
    var geopardyRef = new Firebase("https://geopardy.firebaseio.com/");
    $scope.geopardy = $firebaseArray(geopardyRef);
    $scope.message = "hello";
    Cookie.addCookie($.cookie().team);
    $scope.cookie = Cookie.cookie();
    $scope.login = function () {
      $.cookie('team', $scope.team);
      $scope.cookie = Cookie.cookie();
      $scope.geopardy.$add({name: $scope.team, score: 0, answered: false, explained: false, currentAnswer: '', currentExplanation: '', editExplanation: true, editAnswer: true, answerSubmissionTime: ''}).then(function () {
        window.location.href = '/';
      })
    }
  }

  function header($scope, Cookie) {
    Cookie.addCookie($.cookie().team);
    $scope.cookie = Cookie.cookie();
    $scope.logout = function () {
      $scope.cookie = null;
      $.removeCookie('team');
    }
  }

  function trivia($scope, Cookie, $firebaseArray) {
    $scope.cookie = Cookie.cookie();
    var geopardyRef = new Firebase("https://geopardy.firebaseio.com/");
    $scope.geopardy = $firebaseArray(geopardyRef);
    $scope.submitAnswer = function (answer, team) {
      var time = new Date();
      team.currentAnswer = '';
      team.currentAnswer = answer;
      team.answered = true;
      team.editAnswer = false;
      team.answerSubmissionTime = String(time);
      $scope.geopardy.$save(team);
    }
    $scope.submitExplanation = function (explanation, team) {
      team.currentExplanation = '';
      team.currentExplanation = explanation;
      team.editExplanation = false;
      team.explaned = true;
      $scope.geopardy.$save(team);
    }
    $scope.editExplanation = function (team) {
      team.editExplanation = true;
      $scope.geopardy.$save(team);
    }
    $scope.editAnswer = function (team) {
      team.editAnswer = true;
      $scope.geopardy.$save(team);
    }
  }

})();
