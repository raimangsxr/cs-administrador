'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:SalidaCtrl
 * @description
 * # SalidaCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('SalidaCtrl', function ($scope, $rootScope, $http, _, NgTableParams) {

    $scope.periodos = [
      {alias: 'Última semana', apiPath:'lastWeek'},
      {alias: 'Últimas dos semanas', apiPath:'lastTwoWeeks'},
      {alias: 'Todos los datos', apiPath:'all'}
    ];
  
    $scope.omitStates = {
      FICHERO_ENVIADO_OK: false,
      REE_CONFIRMADO_OK: false,
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
          
          ficheros = _.sortBy(ficheros, function(file) {return -(new Date(file.uploadDate)); }); //sort descending by uploadDate
          $scope.tableParams = new NgTableParams({page: 1, count: 25}, {data: ficheros});
      }, function(error){
          console.log(error);
      });
    };
    
  });
