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
  .component('listDetailAudit', {
    templateUrl: 'components/listDetailAudit/view.html',
    bindings: {
      modalInstance: '<',
      resolve: '<',
    },
    controller: function ListDetailAuditCtrl ($rootScope, $http, $uibModal, NgTableParams) {
      var $ctrl = this;

      $ctrl.$onInit = function(){
        // do all your initializations here.
        // create a local scope object for this component only. always update that scope with bindings. and use that in views also.
        $ctrl.auditOutputData = [];
        $ctrl.selectedFile = {};
        $ctrl.file = $ctrl.resolve.file;
        $ctrl.outputStates = $ctrl.resolve.outputStates;
        $ctrl.showData($ctrl.file);
      };

      $ctrl.showData = function (file) {
        $ctrl.canSetReviewedFile = (file.inputState === 'PROCESADO_INCORRECTO_PDTE_INFORME' || file.inputState === 'PROCESADO_ERROR') ? true : false;
        $http.get('http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/audit/generatedby/' + $rootScope.distrib.alias + '/' + file.filename).then(
          function (response) {
            var auditOutputData = response.data;
            auditOutputData = auditOutputData.map(function(item){
              item.link = "http://"+$rootScope.serverConfig.host+":"+$rootScope.serverConfig.port+"/api/file/"+$rootScope.distrib.alias+"/"+$rootScope.distrib.code+"/"+item.filename;
              return item;
            });
            $ctrl.fileCounter = auditOutputData.length;
            $ctrl.detailTableParams = new NgTableParams({
              page: 1,
              count: 10
            }, {data: auditOutputData});
          }, function (error) {
            console.log(error);
          });
      };

      $ctrl.close = function(){
        $ctrl.modalInstance.dismiss();
      };

      $ctrl.confirmReview = function () {
        var modalInstance = $uibModal.open({
          templateUrl: 'components/listDetailAudit/view_review.html',
          controller: 'ListDetailAuditReviewCtrl',
          size: 'sm',
          resolve: {
            file: $ctrl.file
          }
        });

        modalInstance.result.then(function(result){
          $ctrl.modalInstance.close(result);
        });
      };

      function canSetReviewed(outputFiles) {
        var bads = 0;
        var oks = 0;
        outputFiles.forEach(function (file) {
          if ($ctrl.outputStates.bad.indexOf(file.outputState) >= 0) //is a bad state
            bads++;
          else if ($ctrl.outputStates.ok.indexOf(file.outputState) >= 0)
            oks++;
        });
        return ((bads > 0) &&
        (outputFiles.length === (oks + bads)) &&
        ($ctrl.selectedFile.inputState === 'PROCESADO_INCORRECTO_PDTE_INFORME')) ? true : false;
      }

    }
  });
