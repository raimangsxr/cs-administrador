'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:EntradaCtrl
 * @description
 * # EntradaCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('EntradaCtrl', function ($scope, $rootScope, $http, NgTableParams) {

    $scope.periodos = [
      {alias: 'Última semana', apiPath:'lastWeek'},
      {alias: 'Últimas dos semanas', apiPath:'lastTwoWeeks'},
      {alias: 'Todos los datos', apiPath:'all'}
    ];

    // Auditoria INPUT States
    $scope.omitTypes = {
      OK: true,
      BAD2: true,
      BALD: true,
      ACUM: true,
      AGCLACUM: true,
      ACUMAGREREOS2: true
    };

    $scope.idSelectedFile = null;

    //$scope.distrib = {}; //stacomba
    $scope.period = $scope.periodos[1]; //15 dias

    $scope.changeDistrib = function (index){
      $rootScope.distrib = $rootScope.distribuidoras[index];
      $scope.refreshTable();
    };

    $scope.changePeriod = function(index){
      $scope.period = $scope.periodos[index];
      $scope.refreshTable();
    };

    $scope.selectFile = function(file, index){
      $scope.idSelectedFile = index;
    };

    $scope.refreshTable = function(){
      if(!$rootScope.distrib.alias)
        return;
      $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/query/'.concat($rootScope.distrib.alias,'/inputFs.files/',$scope.period.apiPath)).then(
        function(response){
          var ficheros = response.data.map(function(obj) {
            var fileTokensSlash = obj.filename.split('/');
            var correctFilename = fileTokensSlash[fileTokensSlash.length-1];
            return {
              filename: correctFilename,
              type: obj.metadata.fileType,
              uploadDate: obj.uploadDate,
              sourceParticipant: obj.metadata.sourceParticipant
            };
          });

          // Filter by file type
          ficheros = ficheros.filter(function(file){
            return !$scope.omitTypes[file.type.toUpperCase()];
          });

          var filters = {
            filename: document.querySelector('input[name="filename"]').value,
            type: document.querySelector('input[name="type"]').value,
            sourceParticipant: document.querySelector('input[name="sourceParticipant"]').value,
            uploadDate: document.querySelector('input[name="uploadDate"]').value
          };
          $scope.tableParams = new NgTableParams({
            page: 1,
            count: 25,
            filter: filters
          }, {data: ficheros});
      }, function(error){
          console.log(error);
      });
    };


    // Init
    $scope.refreshTable();
    /*
     setInterval(function(){
     $scope.refreshTable();
     }, $rootScope.pollInterval);
     */

  });

