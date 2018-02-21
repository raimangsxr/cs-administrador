'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('LoginCtrl', function ($window, $scope, $rootScope, $cookies, $http, md5) {

    $scope.login = function (user){
      var authData = {username: user.username, password: md5.createHash(user.password)};
      console.log(authData);
      $http.post('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/login', authData).then(
        function(res){
          $cookies.putObject('currentUser', res.data[0]);
          $rootScope.currentUser = res.data[0];
          $window.location.href = '/';
        },
        function(error){
          console.error(error);
        }
      );
    };
});