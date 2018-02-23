/**
 * Created by rromani on 21/02/18.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('inputDetailAudit', {
    templateUrl: 'components/inputDetailAudit/view.html',
    bindings:{
      file: '=',
      outputStates: '<',
      canReviewFilesByInputState: '<',
      canReviewFilesByType: '<'
    },
    controller: function InputDetailAuditCtrl ($rootScope, $log, $uibModal) {
      var $ctrl = this;

      $ctrl.$onInit = function(){
        // do all your initializations here.
        // create a local scope object for this component only. always update that scope with bindings. and use that in views also.
        $ctrl.canReviewFilesByInputState = this.canReviewFilesByInputState;
        $ctrl.canReviewFilesByType = this.canReviewFilesByType;
        $ctrl.inputFileTypeBinding = {
           'BALD': {
             component: 'BaldDetailAudit',
             size: 'lg',
             resolve: {
               file: $ctrl.file,
               canReviewFilesByInputState: function() { return $ctrl.canReviewFilesByInputState },
               canReviewFilesByType: function() { return $ctrl.canReviewFilesByType }
             }
           },
          'GENERIC': {
            component: 'ListDetailAudit',
            size: 'huge',
            resolve: {
              file: $ctrl.file,
              outputStates: function() { return $ctrl.outputStates; }
            }
          }
        };
      };

      $ctrl.openModal = function (file) {
        var modalConfig = $ctrl.inputFileTypeBinding[file.fileType];
        if (!modalConfig)
          modalConfig = $ctrl.inputFileTypeBinding['GENERIC'];

        var modalInstance = $uibModal.open(modalConfig);

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
