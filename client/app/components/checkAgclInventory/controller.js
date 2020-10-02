/**
 * Created by rromani on 24/09/20.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('checkAgclInventory', {
    templateUrl: 'components/checkAgclInventory/view.html',
    bindings: {
      distrib: '=',
    },
    controller: function Controller ($rootScope, $scope, $http, $log, $q, NgTableParams) {
      var $ctrl = this;
      $ctrl.resultsLoaded = false;
      $ctrl.aggregation = null;
      $ctrl.selectedAggregation = null;
      $ctrl.selectedStartDate = null;

      $scope.$on('distrib-changed', function(event, distrib) {
        $ctrl.distrib = distrib;
        $ctrl.changePeriod();
      });

      $ctrl.changePeriod = function(){
        if(!$ctrl.distrib.alias)
          return;
      };

      function getAgclInventory(agcl) {
        var deferred = $q.defer();
        var baseUrl = 'http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/check/agcl/'+$ctrl.distrib.alias;
        var url = (agcl) ? baseUrl+'/'+agcl : baseUrl;
        $http.get(url).then(
          function(response){
            deferred.resolve(response.data);
          }, function(err){
            $log.error('Error getting Cups inventory!');
            deferred.reject(err);
          }
        );
        return deferred.promise;
      }

      $ctrl.query = function() {
        _unselect();
        $ctrl.loading = true;
        $ctrl.error = false;
        getAgclInventory($ctrl.aggregation).then(
          function(data){
            $ctrl.content = data;
            $ctrl.tableParams = new NgTableParams({
              page: 1,
              count: 50,
              sorting: { aggregation: "asc", startDate: "asc" },
            }, {data: $ctrl.content});
            $ctrl.loading = false;
            $ctrl.resultsLoaded = true;
          }, function(err){
            $log.error('Error getting Cups! - '+JSON.stringify(err));
            $ctrl.loading = false;
            $ctrl.resultsLoaded = true;
          }
        );
      };

      $ctrl.select = function(aggregation, startDate) {
        if (aggregation === $ctrl.selectedAggregation && startDate === $ctrl.selectedStartDate) {
          _unselect();
          return;
        }
        var locatedAggregation = $ctrl.content.find(function(ag) {return ag.aggregation === aggregation && ag.startDate === startDate});
        if (locatedAggregation) {
          $ctrl.selectedObj = locatedAggregation;
          $ctrl.selectedAggregation = locatedAggregation.aggregation;
          $ctrl.selectedStartDate = locatedAggregation.startDate;
          $ctrl.tableCups = new NgTableParams({
            page: 1,
            count: 25,
            sorting: {date: "asc"},
          }, {data: locatedAggregation.cups});
          $ctrl.tableCupsHistory = new NgTableParams({
            page: 1,
            count: 25,
            sorting: {date: "asc"},
          }, {data: locatedAggregation.history});
        } else {
          _unselect();
        }
      };

      function _unselect() {
        $ctrl.selectedObj = null;
        $ctrl.selectedAggregation = null;
        $ctrl.selectedStartDate = null;
        $ctrl.tableCups = null;
        $ctrl.tableCupsHistory = null;
      }
    }
  });
