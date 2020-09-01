/**
 * Created by rromani on 14/03/19.
 */
'use strict';

angular.module('csAdministratorApp')
  .component('checkObjes', {
    templateUrl: 'components/checkObjes/view.html',
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
        $ctrl.period = $ctrl.selected_year + '-' + $ctrl.selected_month;
        $ctrl.years = [new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()-2, new Date().getFullYear()-3];
        $ctrl.months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
      };


      $ctrl.changePeriod = function(){
        $ctrl.period = $ctrl.selected_year + '-' + $ctrl.selected_month;
        if(!$ctrl.distrib.alias)
          return;
      }


      $ctrl.query = function(){
        $ctrl.loading = true;
        $ctrl.error = false;
        $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/check/objes/'+$ctrl.distrib.alias+'/'+$ctrl.selected_year+'/'+$ctrl.selected_month).then(
          function(response){
            $ctrl.content = response.data;
            $q.all([getAllCupsInventory(), getAllObjeinmeInputFiles()]).then(
              function(responsesData) {
                var objes = responsesData[0];
                var objesInputFiles = responsesData[1];
                objes = objes.map(function(obje){
                  var inputs = objesInputFiles.filter(function(input){return input.gridFileId === obje.gridFileId});
                  if (inputs.length > 0) {
                    var input = inputs[0];
                    if (!input.answered) {
                      obje.aceptacion = '';
                    }
                  }
                  return obje;
                });
                $ctrl.tableParams = new NgTableParams({
                  page: 1,
                  count: 50,
                  sorting: { reference: "asc" },
                }, {data: $ctrl.content});
                $ctrl.loading = false;
              },
              function(err) {
                $ctrl.loading = false;
                $ctrl.error = true;
                $log.error(JSON.stringify(err));
              }
            );
          }, function(err){
            $log.error('Error getting Objes! - '+JSON.stringify(err));
          }
        );
      }


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


      function getAllCupsInventory() {
        var deferred = $q.defer();
        var neededCupsInventoryPromises = $ctrl.content
          .filter(function(obje) {
            return obje.tipoObjecion === 'OBJEINME' ||
              obje.tipoObjecion === '15OBJEINME' ||
              obje.tipoObjecion === 'AUTOBJEINME' ||
              obje.tipoObjecion === '15AUTOBJEINME' ||
              obje.tipoObjecion === 'AOBJE2' ||
              obje.tipoObjecion === '15AOBJE2' ||
              obje.tipoObjecion === 'OBJEINMERE' ||
              obje.tipoObjecion === '15OBJEINMERE' ||
              obje.tipoObjecion === 'AUTOBJEINMERE' ||
              obje.tipoObjecion === '15AUTOBJEINMERE'
          })
          .map(function(obje){
            return getCupsInventory(obje.cups.substring(0, 20));
          });
        $q.all(neededCupsInventoryPromises).then(
          function(responsesData) {
            var cupsAgg = responsesData.map(function(cupsInventory){
              var cups = cupsInventory[0].cupsId;
              var instant = $ctrl.content.filter(function(obje) { return obje.cups && obje.cups.substring(0, 20) === cups})[0].fechaInicioObjecion;
              return [cups, getAggFromCupsInventoryAndPeriod(cupsInventory, instant)];
            });
            var objes = processObjes($ctrl.content, cupsAgg);
            deferred.resolve(objes);
          }, function(err){
            $log.error('Error getting Cups inventory!');
            deferred.reject(err);
          }
        );
        return deferred.promise;
      }


      function getAllObjeinmeInputFiles() {
        var deferred = $q.defer();
        var objeinmeInputFilePromises = $ctrl.content
          .filter(function(obje) {
            return obje.tipoObjecion === 'OBJEINME' ||
              obje.tipoObjecion === '15OBJEINME' ||
              obje.tipoObjecion === 'AUTOBJEINME' ||
              obje.tipoObjecion === '15AUTOBJEINME' ||
              obje.tipoObjecion === 'AOBJE2' ||
              obje.tipoObjecion === '15AOBJE2' ||
              obje.tipoObjecion === 'OBJEINMERE' ||
              obje.tipoObjecion === '15OBJEINMERE' ||
              obje.tipoObjecion === 'AUTOBJEINMERE' ||
              obje.tipoObjecion === '15AUTOBJEINMERE'
          })
          .map(function(obje){return getOBJEINMEisAnswered(obje.gridFileId)});
        $q.all(objeinmeInputFilePromises).then(
          function(responsesData) {
            var answers = responsesData.map(function(inputFile){
              var result = {};
              result.gridFileId = inputFile._id;
              result.answered = inputFile.filename.startsWith('REINTEROBJEDISTRIB');
              return result;
            });
            deferred.resolve(answers);
          }, function(err){
            $log.error('Error getting OBJEINME inputFs file!');
            deferred.reject(err);
          }
        );
        return deferred.promise;
      }


      function getOBJEINMEisAnswered(id) {
        var deferred = $q.defer();
        $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/query/'+$ctrl.distrib.alias+'/inputFs.files/id/'+id).then(
          function(response){
            deferred.resolve(response.data);
          }, function(err){
            $log.error('Error getting OBJEINME inputFs file!');
            deferred.reject(err);
          }
        );
        return deferred.promise;
      }


      function getAggFromCupsInventoryAndPeriod(cupsInventory, instant) {
        var objectiveInstant = new Date(instant).getTime();
        var resultAgg = 'De baja';
        cupsInventory.forEach(function(inv){
          var startInvDoc = new Date(inv.fechaModificacion).getTime();
          if (startInvDoc <= objectiveInstant) {
            if (inv.tipoOperacion !== 'B') {
              resultAgg = inv.aggregationId;
            } else {
              resultAgg = 'De baja';
            }
          }
        });
        return resultAgg;
      }


      function processObjes(objes, cupsAgg) {
        return objes.map(function(obje) {
          if (obje.tipoObjecion === 'AOBJEAGCL' ||
              obje.tipoObjecion === '15AOBJEAGCL' ||
              obje.tipoObjecion === 'AOBJEAGRERE' ||
              obje.tipoObjecion === '15AOBJEAGRERE' ||
              obje.tipoObjecion === 'AREVAC') {
            obje.reference = obje.aggregationId.replace(/null/g, '');
            obje.aggregationId = obje.objecionID_REE;
            return obje;
          }
          obje.reference = obje.cups.substring(0, 20);
          var aggs = cupsAgg.filter(function(cupsTuple) {
            return cupsTuple[0] === obje.cups;
          });
          if (aggs.length > 0) {
            obje.aggregationId = aggs[0][1];
          }
          return obje;
        });
      }


    }
  });
