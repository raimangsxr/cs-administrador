/**
 * Created by rromani on 21/02/18.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('outputDetailAudit', {
    templateUrl: 'components/outputDetailAudit/view.html',
    bindings:{
      file: '=',
      outputStates: '<'
    },
    controller: function DetailAuditCtrl ($rootScope, $log, $uibModal) {
      var $ctrl = this;

      $ctrl.confirmReview = function (file) {
        var modalInstance = $uibModal.open({
          templateUrl: 'components/outputDetailAudit/view_review.html',
          controller: 'OutputDetailAuditModalReviewCtrl',
          size: 'sm',
          resolve: {
            file: file
          }
        });

        modalInstance.result.then(function(result){
          if(result) {
            $ctrl.file.revisado = true;
            $log.info('Review saved successfully');
          }
          else
            $log.info('Review dismissed or failed');
        });
      };

    }
  });
