/**
 * Created by rromani on 24/09/20.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('checkAgclDivergence', {
    templateUrl: 'components/checkAgclDivergence/view.html',
    bindings: {
      distrib: '=',
    },
    controller: function Controller ($rootScope, $scope, $http, $log, $q, NgTableParams) {
      var $ctrl = this;
      $ctrl.resultsLoaded = false;
      $ctrl.file = null;

      $scope.$on('distrib-changed', function(event, distrib) {
        $ctrl.distrib = distrib;
        $ctrl.changePeriod();
      });

      $ctrl.changePeriod = function(){
        if(!$ctrl.distrib.alias)
          return;
      };

      function getAgclInventory() {
        var deferred = $q.defer();
        var url = 'http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/check/agcl/'+$ctrl.distrib.alias;
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

      function query() {
        var deferred = $q.defer();
        getAgclInventory().then(
          function(data){
            deferred.resolve(data);
          }, function(err){
            $log.error('Error getting Cups! - '+JSON.stringify(err));
            deferred.reject();
          }
        );
        return deferred.promise;
      }

      function parseSimelDate(simelDate) {
        var dateSplitted = simelDate.split('/');
        var day = dateSplitted[0];
        var month = dateSplitted[1] - 1;
        var year = dateSplitted[2];
        return new Date(year, month, day);
      }

      function upload() {
        var deferred = $q.defer();
        var f = document.getElementById('file').files[0];
        var r = new FileReader();
        r.onloadend = function(e) {
          var lines = e.target.result.split('\r\n').filter(function(line) { return line !== '' });
          var simelPeriods = lines.map(function(line) {
            var period = line.split(';');
            // Example SIMEL line: 0217;0086;5;E0;2A;E1;Orense;05/08/2016;29/08/2016;20/10/2016 12:10:29
            // CS Aggregation: 0193_C_0086_E0_2A_E1_5_D-C
            var prov;
            switch (period[6]) {
              case 'Orense': prov = 'OR'; break;
              case 'La Coruña': prov = 'C'; break;
              case 'Lugo': prov = 'LU'; break;
              case 'Pontevedra': prov = 'PO'; break;
              case 'Desconocida': prov = '??'; break;
              default: prov = 'NOPROVINCE';
            }
            var simelAggregation = [period[0], prov, period[1], period[3], period[4], period[5], period[2], 'D-C'];
            simelAggregation = simelAggregation.join('_');
            var startDate = parseSimelDate(period[7]).toISOString();
            var endDate = parseSimelDate(period[8]).toISOString();
            return {
              aggregation: simelAggregation,
              startDate: startDate,
              endDate: endDate
            };
          });
          deferred.resolve(simelPeriods);
        };
        r.readAsBinaryString(f);
        return deferred.promise;
      }

      $ctrl.compare = function() {
        $ctrl.loading = true;
        $ctrl.error = false;
        $q.all([upload(), query()]).then(
          function([simelPeriods, csPeriods]){
            var savedPeriods = csPeriods.map(function(period) {
              return {
                aggregation: period.aggregation,
                startDateCs: period.startDate,
                endDateCs: period.endDate,
                startDateSimel: null,
                endDateSimel: null,
                valid: false
              };
            });
            simelPeriods.forEach(function(simelPeriod) {
              var period = savedPeriods.find(function(savedPeriod) {return savedPeriod.aggregation === simelPeriod.aggregation && (savedPeriod.startDateCs === simelPeriod.startDate) || savedPeriod.endDateCs === simelPeriod.endDate});
              if (period) {
                period.startDateSimel = simelPeriod.startDate;
                period.endDateSimel = simelPeriod.endDate;
                period.valid = period.startDateCs === period.startDateSimel && period.endDateCs === period.endDateSimel;
              } else {
                savedPeriods.push({
                  aggregation: simelPeriod.aggregation,
                  startDateCs: null,
                  endDateCs: null,
                  startDateSimel: simelPeriod.startDate,
                  endDateSimel: simelPeriod.endDate,
                  valid: false
                });
              }
            });
            var notValidAggregations = new Set(savedPeriods.filter(function(period) {return !period.valid}).map(function(period) {return period.aggregation}));
            $ctrl.notValidAggregations = Array.from(notValidAggregations).map(function(ag) { return {aggregation: ag}});
            $ctrl.tableNotValid = new NgTableParams({
              page: 1,
              count: 25,
              sorting: { aggregation: "asc"},
            }, {data: $ctrl.notValidAggregations});
            $ctrl.content = savedPeriods;
            $ctrl.tableParams = new NgTableParams({
              page: 1,
              count: 50,
              sorting: { aggregation: "asc", startDateCs: "asc", startDateSimel: "asc" },
            }, {data: $ctrl.content});
            $ctrl.loading = false;
            $ctrl.resultsLoaded = true;
          }, function(err){
            $log.error('Error getting data!. ' + err);
            $ctrl.loading = false;
            $ctrl.resultsLoaded = true;
          }
        );
      };

    }
  });
