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
  trivia.$inject = ['$scope', 'cookie', '$firebaseArray', '$firebaseObject', '$location'];

  function config($urlProvider, $locationProvider) {

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: true
    });
    $urlProvider.otherwise('/');

  }

  function run() {
    FastClick.attach(document.body);
  }

  function login($scope, Cookie, $firebaseArray, $location) {
    var geopardyRef = new Firebase("https://geopardy.firebaseio.com/");
    $scope.geopardy = $firebaseArray(geopardyRef);
    $scope.loginError = {};
    $scope.signupError = {};
    Cookie.addCookie($.cookie().team);
    $scope.cookie = Cookie.cookie();
    $scope.signup = function (teamName, password) {
      var unique = true;
      $scope.signupError.team = true;
      $scope.geopardy.forEach(function (team) {
        if (team.name) {
          if (team.name.toLowerCase() === teamName.toLowerCase()) {
            unique = false;
          }
        }
      })
      if (unique) {
        $scope.signupError.team = false;
        $.cookie('team', teamName);
        $scope.cookie = Cookie.cookie();
        $scope.geopardy.$add({name: teamName, password: password, score: 0, answered: false,
            explained: false, currentAnswer: '', currentExplanation: '',
            showAnswer: false, showExplanation: false,
            editExplanation: true, editAnswer: true, answerSubmissionTime: "9999999999999"}
        ).then(function () {
          window.location.href = '/';
        })
      }
    }
    $scope.login = function () {
      var passwordMatch = false;
      $scope.loginError.team = true;
      $scope.loginError.password = false;
      $scope.geopardy.forEach(function (team) {
        if (team.name) {
          if (team.name.toLowerCase() === $scope.team.toLowerCase() && team.password === $scope.password) {
            passwordMatch = true;
          } else if (team.name.toLowerCase() === $scope.team.toLowerCase()) {
            $scope.loginError.team = false;
            $scope.loginError.password = true;
          }
        }
      })
      if (passwordMatch) {
        $.cookie('team', $scope.team);
        $scope.loginError.team = false;
        $scope.loginError.password = false;
        window.location.href = '/';
      }
    }
  }

  function header($scope, Cookie) {
    Cookie.addCookie($.cookie().team);
    $scope.cookie = Cookie.cookie();
    $scope.logout = function () {
      $scope.cookie = null;
      $.removeCookie('team');
      window.location.href = '/login';
    }
  }

  function trivia($scope, Cookie, $firebaseArray, $firebaseObject, $location) {
    $scope.cookie = Cookie.cookie();
    var geopardyRef = new Firebase("https://geopardy.firebaseio.com/");
    var timerRef = new Firebase("https://geopardy.firebaseio.com/timer");
    $scope.geopardy = $firebaseArray(geopardyRef);
    $scope.timer = $firebaseObject(timerRef);
    $scope.display = false;
    $scope.showTimer = false;
    $scope.startedTimer = false;
    $scope.submittable = false;
    var interval;
    $scope.timerState = "Start Timer";
    if (!$scope.cookie) {
      $location.path('/login')
    }
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
      if (team.currentExplanation === '') {
        $scope.timer.teamsLeft = $scope.timer.teamsLeft - 1;
        $scope.timer.$save();
      }
      team.currentExplanation = explanation;
      team.editExplanation = false;
      team.explained = true;
      $scope.geopardy.$save(team);
    }
    $scope.editExplanation = function (team) {
      $scope.explanation = team.currentExplanation;
      team.editExplanation = true;
      $scope.geopardy.$save(team);
    }
    $scope.editAnswer = function (team) {
      $scope.answer = team.currentAnswer;
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
    $scope.delete = function () {
      $scope.geopardy.$remove(this.team);
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
        team.answerSubmissionTime = "9999999999999";
        $scope.geopardy.$save(team);
      })
      $scope.display = false;
    }
    $scope.resetTeams = function () {
      $scope.geopardy.forEach(function (team) {
        if (!team.time && team.name !== "admin") {
          $scope.geopardy.$remove(team);
        }
      })
      $scope.display = false;
    }
    $scope.displayTeams = function () {
      $scope.display = true;
    }
    $scope.hideTeams = function () {
      $scope.display = false;
    }
    $scope.setTimer = function (minutes, seconds) {
      if (!minutes) {
        var mins = "00";
      } else if (minutes < 10) {
        var mins = '0' + minutes
      }  else if (minutes > 99) {
        var mins = '99'
      } else {
        var mins = String(minutes)
      }
      if (!seconds) {
       var secs = "00";
      } else if (seconds < 10) {
        var secs = '0' + seconds
      } else if (seconds > 59) {
        var secs = '59';
      } else {
        var secs = String(seconds)
      }
      if (interval) {
        clearInterval(interval)
        $scope.startedTimer = false;
        $scope.timerState = "Start Timer";
      }
      $scope.timer.set = {minutes: mins, seconds: secs};
      $scope.timer.time = {minutes: $scope.timer.set.minutes, seconds: $scope.timer.set.seconds};
      $scope.timer.$save();
    }
    $scope.startTimer = function () {
      $scope.showTimer = true;
      $scope.timer.time = {minutes: $scope.timer.set.minutes, seconds: $scope.timer.set.seconds};
      $scope.timer.teamsLeft = $scope.geopardy.length - 2;
      $scope.timer.$save();
      $scope.submittable = true;
      if ($scope.startedTimer === false) {
        $scope.submittable = true;
        $scope.startedTimer = true;
        $scope.timerState = "Reset Timer";
        $scope.timer.time.show = true;
        $scope.timer.$save();
        interval = setInterval(function countdown() {
           if($scope.timer.time.seconds === "00") {
               if($scope.timer.time.minutes == "00") {
                 clearInterval(interval)
                 $scope.timer.time.show = false;
                 $scope.timer.$save();
                 return;
               } else {
                   var mins = Number($scope.timer.time.minutes) - 1
                   if (mins < 10) {
                     mins = '0' + mins
                   }
                   $scope.timer.time.minutes = mins;
                   $scope.timer.time.seconds = "60";
                   $scope.timer.$save();
               }
           }
           var secs = Number($scope.timer.time.seconds) - 1
           if (secs < 10) {
             secs = '0' + secs
           }
           $scope.timer.time.seconds = secs;
           $scope.timer.$save();
        }, 1000);
      } else {
        clearInterval(interval)
        $scope.startedTimer = false;
        $scope.submittable = false;
        $scope.timerState = "Start Timer";
      }
    }
    $scope.toggleTimer = function () {
      $scope.showTimer = !$scope.showTimer;
    }
  }

})();
