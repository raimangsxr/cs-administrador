'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:AuditCtrl
 * @description
 * # AuditCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('AuditCtrl', function ($scope, $rootScope, $http, $cookies, _, NgTableParams) {
    $scope.auditOutputData = [];
    $scope.selectedFile = {}

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
      $scope.idSelectedFile = index;
      $scope.selectedFile = file;
      $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/audit/'+$rootScope.distrib.alias+'/'+file.filename).then(
        function(response){
          playAnimations();
          $scope.auditData = response.data;
        }, function(error){
          console.log(error);
      });
    };

    $scope.showDetail = function(file, index){
      $scope.selectFile(file, index);
      $scope.canSetReviewedFile = (file.inputState === 'PROCESADO_INCORRECTO_PDTE_INFORME' || file.inputState === 'PROCESADO_ERROR') ? true : false;
      $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/audit/generatedby/'+$rootScope.distrib.alias+'/'+file.filename).then(
        function(response){
          var auditOutputData = response.data;
          $scope.detailTableParams = new NgTableParams({
            page: 1,
            count: 10
          }, {data: auditOutputData});
          var fileDetailModal = angular.element(document.querySelector('#fileDetailModal'));
          fileDetailModal.modal();
        }, function(error){
          console.log(error);
      });
    }

    $scope.refreshTable = function(){
      if(!$rootScope.distrib.alias)
        return;
      $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/audit/'.concat($rootScope.distrib.alias)).then(
        function(response){
          var ficheros = response.data;
          ficheros = ficheros.filter(function(file){

            file.entrada = (file.hasOwnProperty('inputState')) ? true : false;
            file.salida = (file.hasOwnProperty('outputState')) ? true : false;
            file.revisado = (file.hasOwnProperty('stateForcedBy')) ? true : false;
            file.outputBad = isOutputBad(file);
            file.outputError = isOutputError(file);

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
          var filters = {
            filename: document.querySelector('input[name="filename"]').value,
            creationDate: document.querySelector('input[name="creationDate"]').value
          };
          $scope.tableParams = new NgTableParams({
            page: 1,
            count: 50,
            filter: filters
          }, {data: ficheros});
        }, function(error){
          console.log(error);
      });
    };


    // Init
    $scope.refreshTable();


    /* ------- AUX Functions ---------*/

    function playAnimations(){
      //Animations
      var list = angular.element(document.querySelector('#list'));
      var timeline = angular.element(document.querySelector('#timeline'));

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

    /* ------- END AUX Functions ---------*/

    /* ------- MODAL --------- */

    $scope.setReviewed = function(){
      var file = $scope.selectedFile;
      delete file.errorMsg;

      if(file.hasOwnProperty('inputState')) //fichero de entrada
        file.inputState = 'PROCESADO_COMPLETADO';

      else if(file.hasOwnProperty('outputState')) //fichero de salida
        file.outputState = 'REE_DESPUBLICADO';

      file.stateForcedBy = $cookies.getObject('currentUser').username;
      file.comment = $scope.comment;

      $http.post(
        'http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/audit/'+$rootScope.distrib.alias,
        file
      ).then(
        function(response){
          //nothing to do
        },
        function (error){
          console.error(error);
        }
      );
    };

    $scope.confirmReview = function() {
      var confirmReviewModal = angular.element(document.querySelector('#confirmReviewModal'));
      confirmReviewModal.modal();
    }

    /* AUX Functions */
    function canSetReviewed(outputFiles){
      var bads = 0;
      var oks = 0;
      outputFiles.forEach(function (file){
        if($scope.outputStates.bad.indexOf(file.outputState) >= 0) //is a bad state
          bads++;
        else if ($scope.outputStates.ok.indexOf(file.outputState) >= 0 )
          oks++;
      });
      return ((bads > 0) &&
        (outputFiles.length === (oks + bads)) &&
        ($scope.selectedFile.inputState === 'PROCESADO_INCORRECTO_PDTE_INFORME')) ? true : false;
    }

    /* ------ END MODAL --------- */
  });
