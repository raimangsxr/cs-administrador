'use strict';

/**
 * @ngdoc function
 * @name csAdministratorApp.controller:SalidaCtrl
 * @description
 * # SalidaCtrl
 * Controller of the csAdministratorApp
 */
angular.module('csAdministratorApp')
  .controller('SalidaCtrl', function ($scope, $rootScope, $http, NgTableParams) {

    $scope.periodos = [
      {alias: 'Última semana', apiPath:'lastWeek'},
      {alias: 'Últimas dos semanas', apiPath:'lastTwoWeeks'},
      {alias: 'Todos los datos', apiPath:'all'}
    ];

    $scope.omitStates = {
      FICHERO_ENVIADO_OK: false,
      REE_CONFIRMADO_OK: false
    };

    //$scope.distrib = $rootScope.distribuidoras[0]; //stacomba
    $scope.period = $scope.periodos[1]; //15 dias

    $scope.changeDistrib = function (index){
      $rootScope.distrib = $rootScope.distribuidoras[index];
      $scope.refreshTable();
    };

    $scope.changePeriod = function(index){
      $scope.period = $scope.periodos[index];
      $scope.refreshTable();
    };

    $scope.refreshTable =function(){
      if(!$rootScope.distrib.alias)
        return;
      $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/query/'.concat($rootScope.distrib.alias,'/outputFs.files/',$scope.period.apiPath)).then(
        function(response){
          var ficheros = response.data.map(function(obj) {
            var correctFilename = '';
            if(obj.metadata.fileType.toLowerCase() === 'interobjedistrib'){
              var fileTokensSlash = obj.metadata.exportedFilePath.split('/');
              correctFilename = fileTokensSlash[fileTokensSlash.length-1];
            }
            else
              correctFilename = obj.metadata.exportFileName;
            return {
              filename: correctFilename,
              state: obj.metadata.estado,
              type: obj.metadata.fileType,
              inputFilename: obj.metadata.inputFileName,
              uploadDate: obj.uploadDate,
              sendResult: obj.metadata.resultadoEnvio,
              sourceParticipant: obj.metadata.sourceParticipant
            };
          });

          ficheros = ficheros.filter(function(file){
            return !$scope.omitStates[file.state];
          });

          var filters = {
            filename: document.querySelector('input[name="filename"]').value,
            type: document.querySelector('input[name="type"]').value,
            state: document.querySelector('input[name="state"]').value,
            sendResult: document.querySelector('input[name="sendResult"]').value,
            inputFilename: document.querySelector('input[name="inputFilename"]').value,
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
