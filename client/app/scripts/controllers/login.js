'use strict';

/**
 * @ngdoc function
 * @name csAdministratorApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the csAdministratorApp
 */
angular.module('csAdministratorApp')
  .controller('LoginCtrl', function ($window, $scope, $rootScope, $cookies, $http, md5) {

    $scope.login = function (user){
      var authData = {username: user.username, password: md5.createHash(user.password)};
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
