'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:EntradaCtrl
 * @description
 * # EntradaCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('EntradaCtrl', function ($scope, $rootScope, $http, _, NgTableParams) {

    $scope.periodos = [
      {alias: 'Última semana', apiPath:'lastWeek'},
      {alias: 'Últimas dos semanas', apiPath:'lastTwoWeeks'},
      {alias: 'Todos los datos', apiPath:'all'}
    ];
  
    /* Auditoria INPUT States
    $scope.omitStates = {
      FICHERO_ENVIADO_OK: false,
      REE_CONFIRMADO_OK: false,
    };
    */
  
    // Auditoria INPUT States
    $scope.omitTypes = {
      OK: true,
      BAD2: true,
      BALD: true
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
          
          /* Filter by Auditoria INPUT State
          ficheros = ficheros.filter(function(file){
            return !$scope.omitStates[file.state.toUpperCase()];
          });
          */
          
          // Filter by file type
          ficheros = ficheros.filter(function(file){
            return !$scope.omitTypes[file.type.toUpperCase()];
          });
          
          
          ficheros = _.sortBy(ficheros, function(file) {return -(new Date(file.uploadDate)); }); //sort descending by uploadDate
          $scope.tableParams = new NgTableParams({page: 1, count: 25}, {data: ficheros});
      }, function(error){
          console.log(error);
      });
    };
  
    
  });

