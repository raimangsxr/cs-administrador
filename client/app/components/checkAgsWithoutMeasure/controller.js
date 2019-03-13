/**
 * Created by rromani on 21/02/18.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('checkAgsWithoutMeasure', {
    templateUrl: 'components/checkAgsWithoutMeasure/view.html',
    bindings: {
      distrib: '=',
    },
    controller: function Controller ($rootScope, $scope, $http, $log) {
      var $ctrl = this;


      $scope.$on('distrib-changed', function(event, distrib) {
        $ctrl.distrib = distrib;
        $ctrl.changePeriod();
      });


      $ctrl.$onInit = function(){
        // do all your initializations here.
        // create a local scope object for this component only. always update that scope with bindings. and use that in views also.

        $ctrl.selected_year = new Date().getFullYear();
        $ctrl.selected_month = ((new Date().getMonth()+1<10) ? "0" : "").concat(new Date().getMonth()+1);
        $ctrl.period = $ctrl.selected_year + '-' + $ctrl.selected_month;
        $ctrl.years = [new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()-2, new Date().getFullYear()-3];
        $ctrl.months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

      };


      $ctrl.changePeriod = function(){
        $ctrl.period = $ctrl.selected_year + '-' + $ctrl.selected_month;
        if(!$ctrl.distrib.alias)
          return;
      }

      $ctrl.query = function() {
        $ctrl.loading = true;
        $ctrl.error = false;
        $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/check/aggswomeasures/'+$ctrl.distrib.alias+'/'+$ctrl.selected_year+'/'+$ctrl.selected_month).then(
          function(response){
            $ctrl.zero_aggregations = response.data.zero;
            $ctrl.withoutMeasures_aggregations = response.data.withoutMeasures;
            $ctrl.loading = false;
          }, function(err){
            $ctrl.loading = false;
            $ctrl.error = true;
            $log.error(JSON.stringify(err));
          }
        );
      }
    }
  });
