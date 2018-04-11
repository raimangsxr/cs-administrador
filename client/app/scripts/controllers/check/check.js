'use strict';

/**
 * @ngdoc function
 * @name csAdministratorApp.controller:AuditCtrl
 * @description
 * # AuditCtrl
 * Controller of the csAdministratorApp
 */
angular.module('csAdministratorApp')
  .controller('CheckCtrl', function ($scope, $rootScope) {

    $scope.check_selected = 1;

    $scope.changeDistrib = function (index){
      $rootScope.distrib = $rootScope.distribuidoras[index];
      $scope.$broadcast('distrib-changed', $rootScope.distrib);
    };

  });
