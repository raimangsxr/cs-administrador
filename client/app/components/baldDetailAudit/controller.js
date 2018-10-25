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
  .component('baldDetailAudit', {
    templateUrl: 'components/baldDetailAudit/view.html',
    bindings: {
      modalInstance: '<',
      resolve: '<',
    },
    controller: function BaldDetailAuditCtrl ($rootScope, $http, $log, $uibModal) {
      var $ctrl = this;

      $ctrl.$onInit = function(){
        // do all your initializations here.
        // create a local scope object for this component only. always update that scope with bindings. and use that in views also.
        $ctrl.file = $ctrl.resolve.file;
        $ctrl.canReviewFilesByInputState = $ctrl.resolve.canReviewFilesByInputState;
        $ctrl.canReviewFilesByType = $ctrl.resolve.canReviewFilesByType;
      };

      $ctrl.close = function(){
        $ctrl.modalInstance.dismiss();
      };

      $ctrl.confirmReview = function () {
        var modalInstance = $uibModal.open({
          templateUrl: 'components/baldDetailAudit/view_review.html',
          controller: 'BaldDetailAuditReviewCtrl',
          size: 'sm',
          resolve: {
            file: $ctrl.file
          }
        });

        modalInstance.result.then(function(result){
          if(result) {
            $ctrl.file.revisado = true;
            $log.info('Review saved successfully');
            modalInstance.close(true);
          }
          else
            $log.info('Review dismissed or failed');
        });
      };

    }
  });
