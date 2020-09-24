/**
 * Created by rromani on 24/09/20.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('checkCupsInventory', {
    templateUrl: 'components/checkCupsInventory/view.html',
    bindings: {
      distrib: '=',
    },
    controller: function Controller ($rootScope, $scope, $http, $log, $q, NgTableParams) {
      var $ctrl = this;
      $ctrl.resultsLoaded = false;

      $scope.$on('distrib-changed', function(event, distrib) {
        $ctrl.distrib = distrib;
        $ctrl.changePeriod();
      });

      $ctrl.changePeriod = function(){
        if(!$ctrl.distrib.alias)
          return;
      };

      function getCupsInventory(cups) {
        var deferred = $q.defer();
        $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/check/inventory/'+$ctrl.distrib.alias+'/'+cups).then(
          function(response){
            deferred.resolve(response.data);
          }, function(err){
            $log.error('Error getting Cups inventory!');
            deferred.reject(err);
          }
        );
        return deferred.promise;
      }

      $ctrl.query = function(){
        $ctrl.loading = true;
        $ctrl.error = false;
        getCupsInventory($ctrl.cups).then(
          function(data){
            $ctrl.content = data;
            $ctrl.tableParams = new NgTableParams({
              page: 1,
              count: 50,
              sorting: { fechaModificacion: "asc" },
            }, {data: $ctrl.content});
            $ctrl.loading = false;
            $ctrl.resultsLoaded = true;
          }, function(err){
            $log.error('Error getting Cups! - '+JSON.stringify(err));
            $ctrl.loading = false;
            $ctrl.resultsLoaded = true;
          }
        );
      }
    }
  });
