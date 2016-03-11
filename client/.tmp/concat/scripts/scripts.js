'use strict';

/**
 * @ngdoc overview
 * @name meanApp
 * @description
 * # meanApp
 *
 * Main module of the application.
 */
var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

angular
  .module('meanApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngTable',
    'ngBootstrap',
    'chart.js',
    'underscore',
    'ui.bootstrap',
    'ngMd5'
  ])
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/Login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
      })
      .when('/', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl',
        controllerAs: 'dashboard'
      })
      .when('/revision', {
        templateUrl: 'views/revficheros.html',
        controller: 'RevficherosCtrl',
        controllerAs: 'revFicheros'
      })
      .when('/atencion', {
        templateUrl: 'views/atencion.html',
        controller: 'AtencionCtrl',
        controllerAs: 'atencion'
      })
      .when('/entrada', {
        templateUrl: 'views/entrada/entrada.html',
        controller: 'EntradaCtrl',
        controllerAs: 'entrada'
      })
      .when('/entrada/detalle/:filename', {
        templateUrl: 'views/entrada/entrada_detalle.html',
        controller: 'EntradaDetalleCtrl',
        controllerAs: 'entradaDetalle'
      })
      .when('/salida', {
        templateUrl: 'views/salida/salida.html',
        controller: 'SalidaCtrl',
        controllerAs: 'salida'
      })
      .when('/salida/detalle/:filename', {
        templateUrl: 'views/salida/salida_detalle.html',
        controller: 'SalidaDetalleCtrl',
        controllerAs: 'salidaDetalle'
      })
      .otherwise({
        redirectTo: '/Login'
      });
  }])
  .run(["$rootScope", "$location", function ($rootScope, $location) {
    $rootScope.$on( '$routeChangeStart', function(event, next) {
      if ( $rootScope.currentUser === undefined ) {
        // no logged user, we should be going to #login
        if ( next.templateUrl === 'views/login.html' ) {
          // already going to #login, no redirect needed
        } else {
          // not going to #login, we should redirect now
          $location.path( '/login' );
        }
      }         
    });
  }]);

'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('LoginCtrl', ["$window", "$scope", "$rootScope", "$cookies", "$http", "md5", function ($window, $scope, $rootScope, $cookies, $http, md5) {

    $scope.login = function (user){
      var authData = {username: user.username, password: md5.createHash(user.password)};
      console.log(authData);
      $http.post('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/login', authData).then(
        function(res){
          $cookies.putObject('currentUser', res.data[0]);
          $rootScope.currentUser = res.data[0];
          $window.location.href = '/';
        },
        function(error){
          console.error(error);
        }
      );
    };
}]);
'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:RootCtrl
 * @description
 * # RootCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('RootCtrl', ["$rootScope", "$window", "$cookies", function ($rootScope, $window, $cookies) {

    
    //$rootScope.serverConfig = {host: '192.168.246.153', port: 9000}
    
    $rootScope.serverConfig = {host: 'localhost', port: 3000}
    
  
    $rootScope.distribuidoras = [
      {alias: 'stacomba', 'code': '0185', 'name': 'Eléctrica de Santa Comba'},
      {alias: 'udesa', 'code': '0111', 'name': 'UDESA'},
      {alias: 'cabalar', code: '0183', name: 'Eléctrica de Cabalar'},
      {alias: 'gayoso', code: '0188', name: 'Eléctrica de Gayoso'},
      {alias: 'valdriz', code: '0496', name: 'Eléctrica de Valdriz'},
      {alias: 'ccaldelas', code: '0217', name: 'Eléctrica de Castro Caldelas'},
      {alias: 'egres', code: '0221', name: 'Eléctrica de Gres'},
      {alias: 'mleira', code: '0358', name: 'Eléctrica de Martin Leira'},
      {alias: 'ceind', code: '0127', name: 'Central Eléctrica Industrial'},
      {alias: 'ezas', code: '0186', name: 'Eléctrica de Zas'},
      {alias: 'arnego', code: '0302', name: 'Eléctrica de Arnego'},
      {alias: 'efoxo', code: '0193', name: 'Eléctrica de Foxo'},
      {alias: 'barcalesa', code: '0555', name: 'Eléctrica de Barcalesa'}
    ];
    $rootScope.periodos = [
      {alias: 'Última semana', apiPath:'lastWeek', days:7},
      {alias: 'Últimas dos semanas', apiPath:'lastTwoWeeks', days:15}
    ];
  
    if(!$rootScope.distrib){
      $rootScope.distrib = $rootScope.distribuidoras[0];
    }
  
    var authData = $cookies.getObject('currentUser');
    if(authData){
      $rootScope.currentUser = authData;
    }
  
    $rootScope.logout = function(){
      delete $rootScope.currentUser;
      $cookies.remove('currentUser');
      $window.location.href = '/';
    };
}]);
'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('DashboardCtrl', ["$scope", "$rootScope", "$http", "_", function ($scope, $rootScope, $http, _) {

    $scope.periodos = [
      {alias: 'Última semana', apiPath:'lastWeek', days:7},
      {alias: 'Últimas dos semanas', apiPath:'lastTwoWeeks', days:15}
    ];
  
    $scope.period = $scope.periodos[1];
    
    $scope.distribArray = [{codigo: '0111', nombre: 'UDESA', reqAtencion:11},
                           {codigo: '0188', nombre: 'Eléctrica de Gayoso', reqAtencion:5},
                           {codigo: '0183', nombre: 'Eléctrica de Cabalar', reqAtencion:2},
                           {codigo: '0185', nombre: 'Eléctrica de Santa Comba', reqAtencion:7},
                           {codigo: '0302', nombre: 'Eléctrica de Zas', reqAtencion:1},
                           {codigo: '0655', nombre: 'Eléctrica de Valdriz', reqAtencion:12},
                           {codigo: '0432', nombre: 'Eléctrica de Foxo', reqAtencion:19}
                          ];  
  
    $scope.changeDistrib = function (index){
      $rootScope.distrib = $rootScope.distribuidoras[index];
      refreshCharts();
    }
    
    $scope.changePeriod = function(index){
      $scope.period = $scope.periodos[index];
      refreshCharts();
    }
    
    
    // *********************************************************************************************************************
    // Funciones auxiliares ------------------------------------------------------------------------------------------------
    
    
    function refreshCharts(){
      if(!$rootScope.distrib.alias)
        return;
      $http.get('http://'+$rootScope.serverConfig.host+':'+$rootScope.serverConfig.port+'/api/query/'.concat($rootScope.distrib.alias,'/outputFs.files/',$scope.period.apiPath)).then(
        function(response){
          updatePieChart(response.data);
          updateEvolveStateChart(response.data);
        }, function(error){
          console.log(error);
        }
      );
    }
    
    
    function updatePieChart(data){
      var states = _.groupBy(data, function(fichero){return fichero.metadata.estado || 'Sin estado'});
      $scope.stateChartLabels = Object.keys(states);
      $scope.stateChartColours = getStatesColours($scope.stateChartLabels);
      var stateCounter = [];
      $scope.stateChartLabels.forEach(function(state){
        stateCounter.push(states[state].length);
      });
      $scope.stateChartData = stateCounter;
      $scope.stateChartType = 'Pie';      
    }
  
  
    function updateEvolveStateChart(data){
      var chartData = [], day, states, state, fileStatesIndex, daysIndex;
      var fileStates = ['REE_CONFIRMADO_OK', 'REE_CONFIRMADO_BAD2', 'REE_PDTE_CONFIRMACION',
                        'FICHERO_ENVIADO_OK', 'FICHERO_ENVIADO_ERROR', 'FICHERO_EXPORTADO_OK'];
      fileStates.map(function(state){ //Controlled Array Initialization
        var newArray = [];
        for(var i = 0; i < $scope.period.days; i++) {
          newArray.push(0);
        }
        chartData.push(newArray);
      });
      var days = _.groupBy(data, function(fichero){
        var fileDate = new Date(fichero.uploadDate);
        var day = fileDate.getDate();
        var month = fileDate.getMonth()+1;
        return (day+'/'+month);
      });
      days = fillDatesWithoutFiles(days);
      for(day in days){
        states = _.groupBy(days[day], function(fichero){return fichero.metadata.estado || 'Sin estado'});
        for(state in states){
          if(fileStates.indexOf(state) < 0)
            continue;
          fileStatesIndex = fileStates.indexOf(state);
          daysIndex = Object.keys(days).indexOf(day);
          chartData[fileStatesIndex][daysIndex] = states[state].length;
        }
      }
      $scope.evolveStateChartLabels = Object.keys(days);
      $scope.evolveStateChartColours = getStatesColours(fileStates);
      $scope.evolveStateChartSeries = fileStates;
      $scope.evolveStateChartData = chartData;
      $scope.evolveStateChartOnClick = function (points, evt) {
        console.log(points, evt);
      };
    }
  
    
    function fillDatesWithoutFiles(days){
      var endPeriod = new Date(); //Now
      var startPeriod = new Date();
      var dDay, dMonth;
      var result = {};
      startPeriod.setDate(startPeriod.getDate() - $scope.period.days);
      for (var d = startPeriod; d < endPeriod; d.setDate(d.getDate() + 1)) {
        dDay = d.getDate();
        dMonth = d.getMonth()+1;
        if (Object.keys(days).indexOf(dDay+'/'+dMonth) < 0){
          result[dDay+'/'+dMonth] = [];
        }
        else
          result[dDay+'/'+dMonth] = days[dDay+'/'+dMonth];
      }
      return result;
    }
    
  
    function getStatesColours(states){
      return states.map(function(label){
        switch(label){
          case 'REE_CONFIRMADO_OK':
            return '#00cc00';
          case 'REE_PDTE_CONFIRMACION':
            return '#cccc00';
          case 'REE_CONFIRMADO_BAD2' || 'REE_CONFIRMADO_BAD':
            return '#cc0000';
          case 'FICHERO_ENVIADO_OK':
            return '#008000';
          case 'FICHERO_EXPORTADO_OK':
            return '#cc6600';
          case 'FICHERO_ENVIADO_ERROR':
            return '#800000';
          default:
            return '#fff';
        }
      });
    }
  
  
  }]);


'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('AboutCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('RevficherosCtrl', ["$scope", "$animate", "NgTableParams", function ($scope, $animate, NgTableParams) {
    var ficheros = [
      {
        '_id': '56b22cf6404ce0e29e079d86',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'REE_PDTE_CONFIRMACION',
        'fileType': 'LUNCHPOD',
        'uploadDate': '2016-01-22T06:24:34.000Z'
      },
      {
        '_id': '56b22cf68d562187af8addfd',
        'fileName': 'CLMAG_0402_0463_201504_20150501.0',
        'fileState': 'REE_PDTE_CONFIRMACION',
        'fileType': 'CYCLONICA',
        'uploadDate': '2014-06-30T12:58:50.000Z'
      },
      {
        '_id': '56b22cf6bc68496491f919e4',
        'fileName': 'CLMAG_0493_0233_201505_20150501.0',
        'fileState': 'REE_PDTE_CONFIRMACION',
        'fileType': 'ZENSOR',
        'uploadDate': '2014-11-30T09:40:27.000Z'
      },
      {
        '_id': '56b22cf6ad2ed3b1c673760d',
        'fileName': 'CLMAG_0402_0233_201504_20150501.1',
        'fileState': 'REE_PDTE_CONFIRMACION',
        'fileType': 'FARMEX',
        'uploadDate': '2014-12-22T04:35:46.000Z'
      },
      {
        '_id': '56b22cf6e8cac06431bc9c4b',
        'fileName': 'CLMAG_0402_0233_201504_20150501.2',
        'fileState': 'FICHERO_ENVIADO_ERROR',
        'fileType': 'SEALOUD',
        'uploadDate': '2014-03-22T03:19:59.000Z'
      },
      {
        '_id': '56b22cf605f28d0a66e2f7d8',
        'fileName': 'CLMAG_0301_0233_201504_20150501.0',
        'fileState': 'REE_PDTE_CONFIRMACION',
        'fileType': 'EXOSTREAM',
        'uploadDate': '2014-04-30T10:43:09.000Z'
      },
      {
        '_id': '56b22cf622111b0314331298',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'FICHERO_ENVIADO_ERROR',
        'fileType': 'ENTROFLEX',
        'uploadDate': '2015-03-28T10:06:13.000Z'
      },
      {
        '_id': '56b22cf6256f04afa8666d64',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'FICHERO_ENVIADO_ERROR',
        'fileType': 'AQUAMATE',
        'uploadDate': '2014-03-21T06:22:38.000Z'
      },
      {
        '_id': '56b22cf667091f980da4ab9b',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'REE_CONFIRMADO_BAD2',
        'fileType': 'BOINK',
        'uploadDate': '2015-10-26T09:53:54.000Z'
      },
      {
        '_id': '56b22cf637fe84291084cdf3',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'FICHERO_ENVIADO_OK',
        'fileType': 'TECHTRIX',
        'uploadDate': '2014-01-21T06:17:29.000Z'
      },
      {
        '_id': '56b22cf625f466e5b7bccfbd',
        'fileName': 'CLMAG_0402_0233_201504_20150501.0',
        'fileState': 'FICHERO_ENVIADO_OK',
        'fileType': 'EXOBLUE',
        'uploadDate': '2015-12-21T03:53:12.000Z'
      }
    ];
    $scope.tableParams = new NgTableParams({page: 1, count: 10}, { data: ficheros});
    $scope.datepicker = {
      startDate: new Date(moment().subtract(1, 'day')),
      endDate: new Date(moment().subtract(1, 'day'))
    };
    $scope.ranges = {
        'Hoy': [moment(), moment()],
        'Ayer': [moment().subtract('days', 1), moment().subtract('days', 1)],
        'Últimos 7 días': [moment().subtract('days', 7), moment()],
        'Últimos 30 días': [moment().subtract('days', 30), moment()],
        'Este mes': [moment().startOf('month'), moment().endOf('month')]
    };
    $scope.refreshFileTable = function(){
      var result = [];
      ficheros.forEach(function(file){
        var fecha = new Date(file.uploadDate);
        if((fecha >= $scope.datepicker.startDate) && (fecha < $scope.datepicker.endDate))
          result.push(file);
      })
      $scope.tableParams = new NgTableParams({page: 1, count: 10}, { data: result});
    }
    
    
  }]);

'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:AtencionCtrl
 * @description
 * # AtencionCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('AtencionCtrl', ["$scope", "$http", function ($scope, $http) {
}]);

'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:EntradaCtrl
 * @description
 * # EntradaCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('EntradaCtrl', ["$scope", "$rootScope", "$http", "_", "NgTableParams", function ($scope, $rootScope, $http, _, NgTableParams) {

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
  
    
  }]);


'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:DetalleCtrl
 * @description
 * # DetalleCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('EntradaDetalleCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:SalidaCtrl
 * @description
 * # SalidaCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('SalidaCtrl', ["$scope", "$rootScope", "$http", "_", "NgTableParams", function ($scope, $rootScope, $http, _, NgTableParams) {

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
    
  }]);

'use strict';

/**
 * @ngdoc function
 * @name meanApp.controller:DetalleCtrl
 * @description
 * # DetalleCtrl
 * Controller of the meanApp
 */
angular.module('meanApp')
  .controller('SalidaDetalleCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

angular.module('meanApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/about.html',
    "<p>This is the about view.</p>"
  );


  $templateCache.put('views/atencion.html',
    "<p>This is the atencion view.</p>"
  );


  $templateCache.put('views/dashboard.html',
    "<div ng-controller=\"DashboardCtrl\"> <div class=\"col-md-12 text-center\"> <h3 class=\"text-center\"><label class=\"label label-default\">Mostrando {{distrib.name}}</label></h3> <h4 class=\"text-center\"><label class=\"label label-default\">{{period.alias}}</label></h4> <button class=\"vert-offset-top-1 btn btn-default\" ng-repeat=\"distrib in distribuidoras\" ng-click=\"changeDistrib($index)\">{{distrib.alias|uppercase}}</button> </div> <div class=\"col-md-12 text-center\"> <button class=\"btn btn-default\" ng-repeat=\"period in periodos\" ng-click=\"changePeriod($index)\">{{period.alias}}</button> </div> <div class=\"vert-offset-top-1 col-md-6\"> <div class=\"panel panel-default\"> <div class=\"panel-heading panel-title text-center\"><h5>{{period.alias}}: Estado de ficheros</h5></div> <div class=\"panel-body\"> <canvas id=\"base\" class=\"chart-base\" chart-type=\"stateChartType\" chart-colours=\"stateChartColours\" chart-data=\"stateChartData\" chart-labels=\"stateChartLabels\" chart-legend=\"true\"> </canvas> </div> </div> </div> <div class=\"vert-offset-top-1 col-md-6\"> <div class=\"panel panel-default\"> <div class=\"panel-heading panel-title text-center\"><h5>{{period.alias}}: Evolución de estados</h5></div> <div class=\"panel-body\"> <canvas id=\"line\" class=\"chart chart-line\" chart-data=\"evolveStateChartData\" chart-colours=\"evolveStateChartColours\" chart-labels=\"evolveStateChartLabels\" chart-legend=\"true\" chart-series=\"evolveStateChartSeries\" chart-click=\"onClick\"> </canvas> </div> </div> </div> <div class=\"vert-offset-top-4 col-md-12 vert-offset-bottom-6\"> <div class=\"col-md-4\"> <div class=\"panel panel-default\"> <div class=\"panel-heading panel-title text-center\">Ficheros que requieren atención por distribuidora</div> <div class=\"panel-body\"> <div class=\"text-center\">En construcción</div> <div class=\"list-group\"> <a href=\"#/atencion/distrib/{{distrib.codigo}}\" class=\"list-group-item\" ng-repeat=\"distrib in distribArray\">{{distrib.nombre}}<span class=\"badge\">{{distrib.reqAtencion}}</span></a> </div> </div> </div> </div> <div class=\"col-md-4\"> <div class=\"panel panel-default\"> <div class=\"panel-heading panel-title text-center\">Últimos ficheros de entrada</div> <div class=\"panel-body text-center\">En construcción</div> </div> </div> <div class=\"col-md-4\"> <div class=\"panel panel-default\"> <div class=\"panel-heading panel-title text-center\">Últimas respuestas de REE</div> <div class=\"panel-body text-center\">En construcción</div> </div> </div> </div> </div>"
  );


  $templateCache.put('views/entrada/detalle.html',
    "<p>This is the detalle view.</p>"
  );


  $templateCache.put('views/entrada/entrada.html',
    "<div ng-controller=\"EntradaCtrl\"> <div class=\"text-center\"> <h3><label class=\"label label-default\">Ficheros de Entrada: {{distrib.name}}</label></h3> </div> <div class=\"col-md-12 text-center vert-offset-top-1\"> <div class=\"btn-group\"> <button class=\"btn btn-default\" ng-class=\"{'btn-primary': d === distrib}\" ng-repeat=\"d in distribuidoras\" ng-click=\"changeDistrib($index)\">{{d.alias|uppercase}}</button> </div> </div> <div class=\"col-md-12 text-center\"> <div class=\"btn-group\"> <button class=\"btn btn-default\" ng-class=\"{'btn-primary': p === period}\" ng-repeat=\"p in periodos\" ng-click=\"changePeriod($index)\">{{p.alias}}</button> </div> </div> <div class=\"col-md-12 text-center\"> <div class=\"btn-group\"> <label class=\"btn btn-default disabled\">Omitir los siguientes tipos</label> <label class=\"btn btn-default\" ng-repeat=\"(state,value) in omitTypes\" ng-change=\"refreshTable()\" ng-model=\"omitTypes[state]\" uib-btn-checkbox>{{state}}</label> </div> </div> <div class=\"col-md-12 vert-offset-top-2 vert-offset-bottom-6\"> <div class=\"col-md-7\" id=\"tableDiv\"> <div class=\"panel panel-primary\"> <div class=\"panel-heading\"><h3 class=\"panel-title\">Registro de entrada</h3></div> <div class=\"panel-body\"> <table ng-table=\"tableParams\" class=\"table\" show-filter=\"true\"> <tr ng-click=\"selectFile(file, $index)\" ng-class=\"{selected: $index === idSelectedFile}\" class=\"animate\" ng-repeat=\"file in $data\"> <td title=\"'Nombre'\" filter=\"{'filename': 'text'}\" sortable> <a ng-href=\"http://{{serverConfig.host}}:{{serverConfig.port}}/api/file/{{distrib.alias}}/{{distrib.code}}/inputFs/{{file.filename}}\">{{file.filename}}</a> </td> <!--\n" +
    "              <td title=\"'Tipo'\" filter=\"{ 'type': 'text'}\" sortable=\"'type'\">\n" +
    "                  {{file.type | uppercase}}\n" +
    "              </td>\n" +
    "              <td title=\"'Emisor'\" filter=\"{ 'sourceParticipant': 'text'}\" sortable=\"'sourceParticipant'\">\n" +
    "                  {{file.sourceParticipant | uppercase}}\n" +
    "              </td>\n" +
    "              --> <td title=\"'Fecha'\" filter=\"{ uploadDate: 'text'}\" sortable> {{file.uploadDate | date:\"dd/MM/yyyy 'a las' HH:mm\"}} </td> </tr> </table> </div> </div> </div> <div ng-show=\"idSelectedFile >= 0\" class=\"col-md-5\"> <div class=\"panel panel-primary\"> <div class=\"panel-heading\"><h3 class=\"panel-title\">Linea de tiempo del fichero seleccionado</h3></div> <div class=\"panel-body timeline\"> <dl> <dt>Abril 2015</dt> <dd class=\"pos-right clearfix\"> <div class=\"circ\"></div> <div class=\"time\">14 de Abril</div> <div class=\"events\"> <div class=\"events-body\"> <h4 class=\"events-heading\">Estado X</h4> <p><small class=\"text-muted\"><i class=\"glyphicon glyphicon-time\"></i> hace 11 horas</small></p> <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua.</p> </div> </div> </dd> <dd class=\"pos-left clearfix\"> <div class=\"circ\"></div> <div class=\"time\">10 de Abril</div> <div class=\"events\"> <div class=\"events-body\"> <h4 class=\"events-heading\">Cambia a estado Y</h4> <p><small class=\"text-muted\"><i class=\"glyphicon glyphicon-time\"></i> hace 4 días</small></p> <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua.</p> </div> </div> </dd> <dt>Marzo 2015</dt> <dd class=\"pos-right clearfix\"> <div class=\"circ\"></div> <div class=\"time\">15 de Marzo</div> <div class=\"events\"> <div class=\"events-body\"> <h4 class=\"events-heading\">Flat UI</h4> <p><small class=\"text-muted\"><i class=\"glyphicon glyphicon-time\"></i> hace X días</small></p> <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua.</p> </div> </div> </dd> <dd class=\"pos-left clearfix\"> <div class=\"circ\"></div> <div class=\"time\">8 de Marzo</div> <div class=\"events\"> <div class=\"events-body\"> <h4 class=\"events-heading\">UI design</h4> <p><small class=\"text-muted\"><i class=\"glyphicon glyphicon-time\"></i> hace XX días</small></p> <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua.</p> </div> </div> </dd> </dl> </div> </div> </div> </div> </div>"
  );


  $templateCache.put('views/login.html',
    "<div ng-controller=\"LoginCtrl\"> <div class=\"vert-offset-top-3\"> <div class=\"col-md-12 text-center vert-offset-bottom-2\"> <h3>Concentrador Secundario de UDESA</h3> </div> <div class=\"col-md-offset-4 col-md-4 col-md-offset-4 vert-offset-bottom-7\"> <form name=\"loginForm\" ng-submit=\"login(user)\"> <div class=\"form-group\"> <label for=\"username\">Nombre de usuario</label> <input type=\"text\" class=\"form-control\" id=\"username\" name=\"username\" placeholder=\"Nombre de usuario\" ng-model=\"user.username\" required> <div class=\"alert alert-danger\" ng-show=\"loginForm.username.$dirty && loginForm.username.$error.required\"><label>¡Campo obligatorio!</label></div> </div> <div class=\"form-group\"> <label for=\"password\">Contraseña</label> <input type=\"password\" class=\"form-control\" id=\"password\" name=\"password\" placeholder=\"Contraseña\" ng-model=\"user.password\" required> <div class=\"alert alert-danger\" ng-show=\"loginForm.password.$dirty && loginForm.password.$error.required\"><label>¡Campo obligatorio!</label></div> </div> <button type=\"submit\" class=\"btn btn-primary btn-lg btn-block\" ng-disabled=\"!loginForm.$valid\">Acceder</button> </form> </div> </div> </div>"
  );


  $templateCache.put('views/revficheros.html',
    "<div class=\"row marketing\" ng-controller=\"RevficherosCtrl\"> <div class=\"text-center\"> Selecciona una fecha: <input type=\"daterange\" class=\"btn btn-default dropdown-toggle\" ng-model=\"datepicker\" ranges=\"ranges\" ng-change=\"refreshFileTable()\" format=\"DD MMM YYYY\" separator=\"-\"> <h3><label class=\"label label-default\">Visualizando desde el {{datepicker.startDate|date:\"dd/MM/yyyy\"}} hasta el {{datepicker.endDate|date:\"dd/MM/yyyy\"}}</label></h3> </div> <table ng-table=\"tableParams\" class=\"table\" show-filter=\"true\"> <tr class=\"animate\" ng-repeat=\"file in $data\"> <td title=\"'Nombre'\" filter=\"{ fileName: 'text'}\" sortable> {{file.fileName}} </td> <td title=\"'Tipo'\" filter=\"{ fileType: 'text'}\" sortable> {{file.fileType}} </td> <td title=\"'Fecha de creacion'\" filter=\"{ uploadDate: 'text'}\" sortable> {{file.uploadDate | date:\"dd/MM/yyyy 'a las' hh:mm a\"}} </td> </tr> </table> </div>"
  );


  $templateCache.put('views/salida/detalle.html',
    "<p>This is the detalle view.</p>"
  );


  $templateCache.put('views/salida/salida.html',
    "<div ng-controller=\"SalidaCtrl\"> <div class=\"text-center\"> <h3><label class=\"label label-default\">Ficheros de Salida: {{distrib.name}}</label></h3> </div> <div class=\"col-md-12 text-center vert-offset-top-1\"> <div class=\"btn-group\"> <button class=\"btn btn-default\" ng-class=\"{'btn-primary': d === distrib}\" ng-repeat=\"d in distribuidoras\" ng-click=\"changeDistrib($index)\">{{d.alias|uppercase}}</button> </div> </div> <div class=\"col-md-12 text-center\"> <div class=\"btn-group\"> <button class=\"btn btn-default\" ng-class=\"{'btn-primary': p === period}\" ng-repeat=\"p in periodos\" ng-click=\"changePeriod($index)\">{{p.alias}}</button> </div> </div> <div class=\"col-md-12 text-center\"> <div class=\"btn-group\"> <label class=\"btn btn-default disabled\">Omitir los siguientes estados</label> <label class=\"btn btn-default\" ng-repeat=\"(state,value) in omitStates\" ng-change=\"refreshTable()\" ng-model=\"omitStates[state]\" uib-btn-checkbox>{{state}}</label> </div> </div> <div class=\"col-md-12 vert-offset-top-1 vert-offset-bottom-6\"> <table ng-table=\"tableParams\" class=\"table\" show-filter=\"true\"> <tr ng-class=\"{'green': file.state === 'NO_REQUIERE_ENVIO' ||\n" +
    "                              file.state === 'FICHERO_ENVIADO_OK' ||\n" +
    "                              file.state === 'REE_CONFIRMADO_OK',\n" +
    "                    'red': file.state === 'REE_CONFIRMADO_BAD2' ||\n" +
    "                              file.state === 'REE_CONFIRMADO_BAD' ||\n" +
    "                              file.state === 'FICHERO_ENVIADO_ERROR',\n" +
    "                    'yellow': file.state === 'REE_PDTE_CONFIRMACION'\n" +
    "                    }\" class=\"animate\" ng-repeat=\"file in $data\"> <td title=\"'Nombre'\" filter=\"{'filename': 'text'}\" sortable> <a ng-href=\"http://{{serverConfig.host}}:{{serverConfig.port}}/api/file/{{distrib.alias}}/outputFs/{{file.filename}}\">{{file.filename}}</a> </td> <td title=\"'Tipo'\" filter=\"{ 'type': 'text'}\" sortable> {{file.type}} </td> <td title=\"'Estado'\" filter=\"{'state': 'text'}\" sortable> <span ng-if=\"file.state !== 'REE_CONFIRMADO_BAD2'\">{{file.state}}</span> <a class=\"\" ng-if=\"file.state === 'REE_CONFIRMADO_BAD2'\" ng-href=\"http://{{serverConfig.host}}:{{serverConfig.port}}/api/file/{{distrib.alias}}/{{distrib.code}}/inputFs/{{file.filename}}.bad2\">{{file.state}}</a> </td> <td title=\"'Envio'\" filter=\"{'sendResult': 'text'}\" sortable> {{file.sendResult}} </td> <td title=\"'Generado por'\" filter=\"{'inputFilename':'text'}\" sortable> <a ng-href=\"http://{{serverConfig.host}}:{{serverConfig.port}}/api/file/{{distrib.alias}}/{{distrib.code}}/inputFs/{{file.inputFilename}}\">{{file.inputFilename}}</a> </td> <td title=\"'Fecha de subida'\" filter=\"{ uploadDate: 'text'}\" sortable> {{file.uploadDate | date:\"dd/MM/yyyy 'a las' HH:mm\"}} </td> </tr> </table> </div> </div>"
  );

}]);
