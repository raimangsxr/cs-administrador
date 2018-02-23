'use strict';

/**
 * @ngdoc function
 * @name csAdministratorApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the csAdministratorApp
 */
angular.module('csAdministratorApp')
  .controller('DashboardCtrl', function ($scope, $rootScope, $http, _) {

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


  });

