'use strict';

angular.module('Authentication')  
.factory('AuthenticationService', function ($rootScope, $http, $cookieStore) {
  var service = {};

  service.Login = function (username, password) {
    $http.post('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/login', { username: username, password: password })
    .then(function (response) { //success
      $cookieStore.put('currentUser', {isLogged: true, username: username});
    }, function(err) { //error
      console.error(err);
    });
  };

  service.Logout = function () {
    $cookieStore.remove('currentUser');
  };

  return service;
});