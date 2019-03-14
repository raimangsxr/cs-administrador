/**
 * Created by rromani on 14/03/19.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('checkAgcl', {
    templateUrl: 'components/checkAgcl/view.html',
    bindings: {
      distrib: '=',
    },
    controller: function Controller ($rootScope, $scope, $http, $log, $q, NgTableParams) {
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
        $ctrl.selected_day = ((new Date().getDate()<10) ? "0" : "").concat(new Date().getDate());
        $ctrl.years = [new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()-2, new Date().getFullYear()-3];
        $ctrl.months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        $ctrl.days = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
      };


      $ctrl.changePeriod = function(){
        if(!$ctrl.distrib.alias)
          return;
      }


      $ctrl.query = function(){
        $ctrl.loading = true;
        $ctrl.error = false;
        $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/check/agcl/'+$ctrl.distrib.alias+'/'+$ctrl.selected_year+'/'+$ctrl.selected_month+'/'+$ctrl.selected_day+'/'+$ctrl.aggregation).then(
          function(response){
            $ctrl.content = response.data;
            $ctrl.tableParams = new NgTableParams({
              page: 1,
              count: 50,
              sorting: { cups: "asc" },
            }, {data: $ctrl.content});
            $ctrl.loading = false;
          }, function(err){
            $log.error('Error getting Cups! - '+JSON.stringify(err));
          }
        );
      }
    }
  });
