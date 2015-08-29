(function() {
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
    .config(config)
    .run(run)
    .controller('login', login)
    .controller('header', header)
    .controller('trivia', trivia)
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
      var unique = true;
      $scope.geopardy.forEach(function (team) {
        if (team.name.toLowerCase() === $scope.team.toLowerCase()) {
          unique = false;
        }
      })
      if (unique) {
        $.cookie('team', $scope.team);
        $scope.cookie = Cookie.cookie();
        $scope.geopardy.$add({name: $scope.team, password: $scope.password, score: 0, answered: false,
            explained: false, currentAnswer: '', currentExplanation: '',
            showAnswer: false, showExplanation: false,
            editExplanation: true, editAnswer: true, answerSubmissionTime: ''}
        ).then(function () {
          window.location.href = '/';
        })
      }
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
      team.answerSubmissionTime = String(time.getTime());
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
    $scope.up = function () {
      this.team.score++;
      $scope.geopardy.$save(this.team);
    }
    $scope.down = function () {
      this.team.score--;
      $scope.geopardy.$save(this.team);
    }
    $scope.showAnswer = function () {
      this.team.showAnswer = !this.team.showAnswer;
      $scope.geopardy.$save(this.team);
    }
    $scope.showExplanation = function () {
      this.team.showExplanation = !this.team.showExplanation;
      $scope.geopardy.$save(this.team);
    }
    $scope.resetAnswers = function () {
      $scope.geopardy.forEach(function (team) {
        team.currentAnswer = '';
        team.currentExplanation = '';
        team.answered = false;
        team.explained = false;
        team.showAnswer = false;
        team.showExplanation = false;
        team.editExplanation = true;
        team.editAnswer = true;
        team.answerSubmissionTime = '';
        $scope.geopardy.$save(team);
      })
    }
    $scope.resetTeams = function () {
      $scope.geopardy.forEach(function (team) {
        $scope.geopardy.$remove(team);
      })
    }
  }

})();
