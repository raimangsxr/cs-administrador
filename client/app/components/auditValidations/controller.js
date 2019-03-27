/**
 * Created by rromani on 14/03/19.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('auditValidations', {
    templateUrl: 'components/auditValidations/view.html',
    bindings: {
      validations: '=',
    },
    controller: function Controller () {
      var $ctrl = this;

      $ctrl.$onInit = function(){
        // do all your initializations here.
        // create a local scope object for this component only. always update that scope with bindings. and use that in views also.
        $ctrl.cierresValidation = $ctrl.validations;
      };
    }
  });
