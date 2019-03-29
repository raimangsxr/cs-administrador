'use strict';

/**
 * @ngdoc function
 * @name csAdministratorApp.controller:AuditCtrl
 * @description
 * # AuditCtrl
 * Controller of the csAdministratorApp
 */
angular.module('csAdministratorApp')
  .controller('AuditCtrl', function ($scope, $rootScope, $http, $log, $q, $cookies, $uibModal, _, NgTableParams) {
    $scope.auditOutputData = [];
    $scope.selectedFile = {};
    $scope.error = false;

    // BALD lost tolerance in percent
    $scope.BALD_tolerance = 15;

    // Audit INPUT States
    $scope.inputStateColors = {
      green: ['DUPLICADO', 'PROCESADO_COMPLETADO'],
      yellow: ['RECIBIDO', 'AUDITADO', 'PROCESANDO', 'PROCESADO_OK', 'REE_PDTE_COMUNICACION', 'PROCESADO_OK_PDTE_NOTIF',
        'PROCESADO_OK_NOTIF', 'PROCESADO_OK_NO_NOTIF', 'PROCESADO_INCORRECTO', 'PROCESADO_INCORRECTO_NOTIF',
        'PROCESADO_INCORRECTO_COMPLETADO'],
      red: ['PROCESADO_ERROR', 'PROCESADO_OK_NOTIF_ERROR', 'PROCESADO_INCORRECTO_NOTIF_ERROR',
        'PROCESADO_INCORRECTO_PDTE_INFORME']
    };

    // Audit OUTPUT States
    $scope.outputStates = {
      error : ['REE_DESPUBLICADO_ERROR', 'REE_RECOGIDA_TIMEOUT', 'REE_CONFIRMADO_TIMEOUT', 'REE_CONFIRMADO_TIMEOUT_OK'],
      bad : ['REE_CONFIRMADO_BAD', 'REE_CONFIRMADO_BAD2', 'REE_DESPUBLICADO_BAD', 'REE_CONFIRMADO_TIMEOUT_BAD', 'REE_CONFIRMADO_TIMEOUT_BAD2'],
      pending: ['REE_PUBLICADO', 'REE_RECOGIDO_PDTE_CONFIRM'],
      ok : ['REE_CONFIRMADO_OK', 'REE_RECOGIDO', 'REE_DESPUBLICADO', 'REE_NO_PUBLICADO', 'REE_NO_PUBLICADO_NOTIFICABLE']
    }

    // Can review files
    $scope.canReviewFilesByInputState = ['PROCESADO_ERROR', 'PROCESADO_INCORRECTO_PDTE_INFORME'];
    $scope.canReviewFilesByOutputState = ['REE_CONFIRMADO_BAD', 'REE_CONFIRMADO_BAD2', 'REE_DESPUBLICADO_BAD', 'REE_CONFIRMADO_TIMEOUT_BAD', 'REE_CONFIRMADO_TIMEOUT_BAD2'];
    $scope.canReviewFilesByType = ['BALD','CUPS','CUPS34','CUPS5'];

    // Can omit FileTypes
    $scope.omitTypes = {
      OK: true,
      BAD2: true,
      PERFF: true,
      BALD: true,
      ACUM: true,
      AGCLACUM: true,
      ACUMAGREREOS2: true
    };

    // Can omit InputStateTypes
    $scope.omitInputStates = {
      PROCESADO_COMPLETADO: false,
      DUPLICADO: true
    };

    // Can omit OutputStateTypes
    $scope.omitOutputStates = {
      REE_DESPUBLICADO: true
    };

    // Can omit Input/Output Files
    $scope.omitIO = {
      ENTRADA: false,
      SALIDA: false
    };

    $scope.idSelectedFile = null;

    $scope.changeDistrib = function (index){
      $rootScope.distrib = $rootScope.distribuidoras[index];
      $scope.refreshTable();
    };

    $scope.selectFile = function(file, index){
      $scope.auditData = null;
      $scope.auditValidation = null;
      $scope.idSelectedFile = index;
      $scope.selectedFile = file;
      $scope.error = false;
      getFileInfo(file).then(
        function(results){
          playAnimations();
          $scope.auditData = results[0];
          $scope.auditValidation = results[1][0] || null;
        }, function(error){
          console.log(error);
          $scope.error = true;
      });
    };

    function getFileInfo(file) {
      var deferred = $q.defer();
      var fileAuditPromise = $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/audit/'+$rootScope.distrib.alias+'/'+file.filename);
      var fileValidationPromise = $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/audit/validation/'+$rootScope.distrib.alias+'/'+file.filename);
      fileAuditPromise.then(
        function(results) {
          $scope.fileInfoResults = results.data;
          fileValidationPromise.then(
            function(results) {
              deferred.resolve([$scope.fileInfoResults, results.data]);
            }, function(err) {
              $log.info('Error getting validation info. Maybe the collection is not created yet.. Error: '+JSON.stringify(err));
              deferred.resolve([$scope.fileInfoResults]);
            }
          );
        },
        function(err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }

    $scope.refreshTable = function(){
      if(!$rootScope.distrib.alias)
        return;
      $scope.loading = true;
      $scope.error = false;
      $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/audit/'.concat($rootScope.distrib.alias)).then(
        function(response){
          var files = response.data;
          files = files.map(function(file){

            file.entrada = (file.hasOwnProperty('inputState')) ? true : false;
            file.salida = (file.hasOwnProperty('outputState')) ? true : false;
            file.revisado = (file.hasOwnProperty('stateForcedBy')) ? true : false;
            file.outputBad = isOutputBad(file);
            file.outputError = isOutputError(file);
            file.link = 'http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/file/'+$rootScope.distrib.alias+'/'+$rootScope.distrib.code+'/'+file.filename;

            return file;
          });
          processFileDetails(files).then(
            function(results){
              var filtered_results = results.filter(function(file){
                var filterRevisado = true;
                if($scope.omitInputStates['REVISADO'])
                  filterRevisado = file.revisado;
                var filterEntrada = true;
                if($scope.omitIO['ENTRADA'])
                  filterEntrada = !file.entrada;
                var filterSalida = true;
                if($scope.omitIO['SALIDA'])
                  filterSalida = !file.salida;

                return !$scope.omitTypes[file.fileType] && !$scope.omitInputStates[file.inputState] && !$scope.omitOutputStates[file.outputState]
                  && filterRevisado && filterEntrada && filterSalida;
              });
              $scope.loading = false;
              var filters = {
                filename: document.querySelector('input[name="filename"]').value,
                creationDate: document.querySelector('input[name="creationDate"]').value
              };
              $scope.tableParams = new NgTableParams({
                page: 1,
                count: 50,
                sorting: { creationDate: "desc" },
                filter: filters
              }, {data: filtered_results});
            },
            function(err){
              $scope.loading = false;
              $scope.error = true;
              $log.error(JSON.stringify(err));
            }
          );
        }, function(err){
          $scope.loading = false;
          $scope.error = true;
          $log.error(JSON.stringify(err));
      });
    };


    $scope.isInput = function(file){
      return file.entrada;
    };
    $scope.isOutput = function(file){
      return file.salida;
    };

    // Init
    $scope.refreshTable();


    /* ------- AUX Functions ---------*/

    function playAnimations(){
      //Animations
      var list = angular.element(document.querySelector('#list'));
      var timeline = angular.element(document.querySelector('#details'));

      if(!timeline.hasClass('animated')) { //First time
        list.removeClass('col-md-12');
        list.addClass('col-md-7 animated fadeInLeft');
        timeline.addClass('animated fadeInRight');
      }
      else { //Next
        timeline.removeClass('fadeInRight');
        timeline.removeClass('rubberBand'); //workaround to replay animation
        setTimeout(function(){
          timeline.addClass('rubberBand');
        }, 1);
      }
    }

    /**
     * Especifica si el fichero de salida está en un estado de auditoria bad
     * @param file
     */
    function isOutputBad(file){
      if (file.hasOwnProperty('outputState')){ //fichero de salida

        if ( $scope.outputStates.bad.indexOf(file.outputState) >= 0 ) //is a bad state
          return true;

      }
      return false;
    }

    /**
     * Especifica si el fichero de salida está en un estado de auditoria error
     * @param file
     */
    function isOutputError(file){
      if (file.hasOwnProperty('outputState')){ //fichero de salida

        if ( $scope.outputStates.error.indexOf(file.outputState) >= 0 ) //is a error state
          return true;

      }
      return false;
    }

    function processFileDetails(files){
      var deferred = $q.defer();
      var promises = [];
      var notProcessed = [];
      files.forEach(function(file){
        if (file.fileType.toUpperCase() === 'BALD') {
          if (file.details){ //no need to get the file to calculate details
            file.inputState = _parseBaldState(file);
          }
          else {
            promises.push(_getAndParseBald(file));
          }
        }
        /*
        if (file.fileType.toUpperCase() === 'CIERRES') {
          promises.push(_getAndParseBald(file));
          return
        }
        */
        notProcessed.push(file);
      });
      $q.all(promises).then(
        function(results){
          var total_files = notProcessed.concat(results);
          deferred.resolve(total_files);
        },
        function(err){
          $log.error(JSON.stringify(err));
          deferred.reject('Error getting files!');
        }
      );
      return deferred.promise;
    }

    function _getAndParseBald(file){
      var deferred = $q.defer();
      $http.get(file.link).then(
        function (response) {
          var fields = response.data.trim().split(';');
          file.details = {};
          file.details.demand = parseInt(fields[15]);
          file.details.adquisition = parseInt(fields[16]);
          file.details.lost = parseInt(fields[17]);
          file.details.lost_percent = parseFloat(fields[18]);
          _updateAudit(angular.copy(file));
          file.inputState = _parseBaldState(file);
          deferred.resolve(file);
        }, function (err) {
          $log.error(JSON.stringify(err));
        });
      return deferred.promise;
    }

    function _parseBaldState(file){
      if((file.details.lost_percent < 0 || file.details.lost_percent > $scope.BALD_tolerance) && !file.revisado)
        return file.inputState = 'PROCESADO_INCORRECTO_PDTE_INFORME';
      return file.inputState;
    }

    function _updateAudit(file){
      $http.put(
        'http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/audit/' + $rootScope.distrib.alias + '/' + file._id, file
      );
    }

    /* ------- END AUX Functions ---------*/

  });
