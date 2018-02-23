/**
 * Created by rromani on 21/02/18.
 */
'use strict';

/**
 * @ngdoc function
 * @name csAdministratorApp.controller:DetailBaldCtrl
 * @description
 * # AuditCtrl
 * Controller of the csAdministratorApp
 */
angular.module('csAdministratorApp')
  .controller('BaldDetailAuditReviewCtrl', ['$rootScope', '$scope', '$log', '$http', '$cookies', '$uibModal', '$uibModalInstance', 'file', function ($rootScope, $scope, $log, $http, $cookies, $uibModal, $uibModalInstance, file) {

    $scope.close = function(){
      $uibModalInstance.close();
    };

    $scope.setReviewed = function () {
      delete file.errorMsg;

      if (file.hasOwnProperty('inputState')) //fichero de entrada
        file.inputState = 'PROCESADO_COMPLETADO';

      file.stateForcedBy = $cookies.getObject('currentUser').username;
      file.comment = $scope.comment;

      $http.post(
        'http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/audit/' + $rootScope.distrib.alias,
        file
      ).then(
        function (response) {
          $uibModalInstance.close(true);
        },
        function (error) {
          $log.error(error);
          $uibModalInstance.close(false);
        }
      );
    };

  }]
  );
