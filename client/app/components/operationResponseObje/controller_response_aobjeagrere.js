
angular.module('csAdministratorApp')
  .controller('OperationResponseAOBJEAGRERECtrl', ['$rootScope', '$scope', '$log', '$http', '$cookies', '$uibModal', '$uibModalInstance', '$q', 'file', function ($rootScope, $scope, $log, $http, $cookies, $uibModal, $uibModalInstance, $q, file) {

    $scope.file = file;
    $scope.responses = {};

    $scope.close = function(){
      $uibModalInstance.close();
    };

    $scope.noManualPendingResponses = function() {
      $scope.file.metadata.fechaRevisionManual = new Date().toISOString();
      $scope.file.metadata.noManualPendingResponses = true;
      _updateInputFile($scope.file);
      $uibModalInstance.close(true);
    };

    _getAndParseInputFile(file).then(
      function (parsedFile){
        $scope.objes = parsedFile.metadata.details.filter(function(obje) {
          return obje.necesitaRevisionManual;
        });
        $scope.objes.forEach(function(obje){
          $scope.responses[obje.agregacion] = {};
          $scope.responses[obje.agregacion].aceptado = null;
          $scope.responses[obje.agregacion].segundoComer = '9999';
          $scope.responses[obje.agregacion].comentarioRespuesta = null;
        });
      },
      function (error){
        $log.error(JSON.stringify(error));
      }
    );



    $scope.setResponse = function () {
      delete file.link;

      var fileMetadataWithResponses = $scope.objes.map(function(obje){
        var response = $scope.responses[obje.agregacion];
        Object.assign(obje, response); // Mergeamos las propiedades de ambos
        return obje;
      });

      _getReinterobjeData(file._id, file.filename, fileMetadataWithResponses).then(
        function(generateFiles){
          $http.post(
            'http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/operation/response-obje/' + $rootScope.distrib.alias,
            generateFiles
          ).then(
            function (response) {
              file.metadata.fechaRevisionManual = new Date().toISOString();
              _updateInputFile(file);
              $uibModalInstance.close(true);
            },
            function (error) {
              $log.error(error);
              $uibModalInstance.close(false);
            }
          );
        },
        function(error){
          log.error(JSON.stringify(error));
        }
      );
    };


    function _getAndParseInputFile(file){
      var deferred = $q.defer();
      if(file.metadata.hasOwnProperty('details')) {
        deferred.resolve(file);
      }
      else {
        var file_map = [];
        $http.get(file.link).then(
          function (fileResponse) {
            var file_lines = fileResponse.data.trim().split('\n');
            file_map = file_lines.map(function(line){
              var fields = line.trim().split(';');
              var result = {};
              result.id_objecion = fields[0];
              result.fechaInicio = fields[5];
              result.fechaFin = fields[6];
              return result;
            });
            $http.get('http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/query/objecion-intercambio-distribuidor/'+ $rootScope.distrib.alias + '/' + file._id).then(
              function (response) {
                file.metadata.details = [];
                response.data.forEach(function(obje){
                  var file_line = file_map.filter(function(obj) { return obj.id_objecion === obje.objecionID_REE})[0];
                  var aggFields = obje.aggregationId.slice(0, -4).split('_');
                  var aggregationId = [aggFields[0], aggFields[2], aggFields[3], aggFields[4], aggFields[5], aggFields[6], aggFields[1]].join(';');
                  var obje_detail = {};
                  obje_detail.id_objecion = obje.objecionID_REE;
                  obje_detail.agregacion = aggregationId;
                  obje_detail.fechaInicio = file_line.fechaInicio;
                  obje_detail.fechaFin = file_line.fechaFin;
                  obje_detail.motivo = obje.motivo;
                  obje_detail.publicado = obje.aePublicado; // debería ser asPublicado pero en el código existe este bug y como son archivos que desaparecerán, no se cambia
                  obje_detail.propuesto = obje.aePropuesto; // debería ser asPublicado pero en el código existe este bug y como son archivos que desaparecerán, no se cambia
                  obje_detail.comentario = obje.comentarioEmisorObjecion;
                  obje_detail.objeAAutoObje = obje.autoObjecion;
                  obje_detail.necesitaRevisionManual = (obje.idObjecionesDesagregadas.length === 0 && obje.respuesta === false && aggFields[2] !== '9999');
                  file.metadata.details.push(obje_detail);
                });
                _updateInputFile(angular.copy(file));
                deferred.resolve(file);
              }, function (err) {
                $log.error(JSON.stringify(err));
              });
          }, function (err) {
            $log.error(JSON.stringify(err));
          });
      }
      return deferred.promise;
    }

    function _updateInputFile(file){
      delete file.link;
      $http.put(
        'http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/file/' + $rootScope.distrib.alias + '/' + file.filename, file
      );
    }


    function _getReinterobjeData(fileId, filename, objesMetadata){
      var deferred = $q.defer();
      $http.get('http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/query/objecion-intercambio-distribuidor/'+ $rootScope.distrib.alias + '/' + fileId).then(
        function (response) {
          var filename_fields = filename.split('_');
          var responseObjesData = objesMetadata.map(function(obje){
            var objeDocument = response.data.filter(function(doc) {
              var doc_agregacion_vieja = [doc.codDistribuidor, doc.codComercializador, doc.codNivelTension, doc.codTarifa, doc.codDH, doc.codTipoPunto, doc.codProvincia].join(';');
              var doc_agregacion_nueva = [doc.codDistribuidor, doc.codComercializador, doc.codNivelTension, doc.codTarifa, doc.codDH, doc.codTipoPunto, doc.codProvincia].join(';');
              var obje_agregacion = obje.agregacion.replace(/null/g, '');
              return doc_agregacion_vieja === obje_agregacion || doc_agregacion_nueva === obje_agregacion;
            })[0];
            return [
              objeDocument._id,
              objeDocument.codDistribuidor,
              objeDocument.codTipoPunto,
              objeDocument.codComercializador,
              null,
              objeDocument.codProvincia,
              objeDocument.codTarifa,
              objeDocument.codDH,
              objeDocument.codNivelTension,
              obje.fechaInicio,
              obje.fechaFin,
              null, // AE publicado
              null, // AE propuesto
              obje.publicado, // AS publicado
              obje.propuesto, // AS propuesto
              null, // R1 publicado
              null, // R1 propuesto
              null, // R2 publicado
              null, // R2 propuesto
              null, // R3 publicado
              null, // R3 propuesto
              null, // R4 publicado
              null, // R4 propuesto
              objeDocument.tipoDemanda, // tipoDemanda (= tipoAutoconsumo)
              objeDocument.magnitud, // magnitud
              obje.motivo,
              obje.comentario,
              objeDocument.objecionID_REE,
              objeDocument.acuseRecibo,
              obje.aceptado,
              obje.comentarioRespuesta,
              'N'
            ].join(';');
          });
          var generateFiles = {};
          responseObjesData.forEach(function(obje){
            var responseFilename = [
                'REINTEROBJEDISTRIB',
                filename_fields[0],
                filename_fields[1],
                filename_fields[2],
                new Date().getFullYear().toString()+((new Date().getMonth()+1<10)?'0'+(new Date().getMonth()+1).toString():(new Date().getMonth()+1).toString())+new Date().getDate().toString()
            ].join('_');
            if(generateFiles.hasOwnProperty(responseFilename)) {
              generateFiles[responseFilename].data.push(obje);
            }
            else {
              generateFiles[responseFilename] = {};
              generateFiles[responseFilename].filename = responseFilename;
              generateFiles[responseFilename].data = [obje];
            }
          });
          var result = [];
          for (var file in generateFiles){
            result.push(generateFiles[file]);
          }
          $q.all(result.map(function(file){ return getLastFilename(file.filename)})).then(
            function(filenames){
              result = result.map(function(file){
                var lastVersion = parseInt(filenames.filter(function(filename) { return filename.split('.')[0] === file.filename })[0].split('.')[1]);
                file.filename = file.filename + '.' + (lastVersion+1).toString();
                return file;
              });
              deferred.resolve(result);
            },
            function(err){
              $log.error(JSON.stringify(err));
            }
          )
        }, function (err) {
          $log.error(JSON.stringify(err));
        });
      return deferred.promise;
    }


    function getLastFilename(filename) {
      var deferred = $q.defer();
      $http.get('http://' + $rootScope.serverConfig.host + ':' + $rootScope.serverConfig.port + '/api/query/last-file-by-input-filename/'+ $rootScope.distrib.alias + '/' + filename).then(
        function(response){
          if (response.data.length > 0)
            deferred.resolve(response.data[0].filename);
          else
            deferred.resolve(filename+'.100');
        }, function (err) {
          $log.error(JSON.stringify(err));
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }

  }]
  );
