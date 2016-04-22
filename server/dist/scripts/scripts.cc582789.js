"use strict";var underscore=angular.module("underscore",[]);underscore.factory("_",["$window",function(a){return a._}]),angular.module("meanApp",["ngAnimate","ngCookies","ngMessages","ngResource","ngRoute","ngSanitize","ngTouch","ngTable","ngBootstrap","chart.js","underscore","ui.bootstrap","ngMd5"]).config(["$routeProvider",function(a){a.when("/Login",{templateUrl:"views/login.html",controller:"LoginCtrl",controllerAs:"login"}).when("/",{templateUrl:"views/dashboard.html",controller:"DashboardCtrl",controllerAs:"dashboard"}).when("/revision",{templateUrl:"views/revficheros.html",controller:"RevficherosCtrl",controllerAs:"revFicheros"}).when("/atencion",{templateUrl:"views/atencion.html",controller:"AtencionCtrl",controllerAs:"atencion"}).when("/entrada",{templateUrl:"views/entrada/entrada.html",controller:"EntradaCtrl",controllerAs:"entrada"}).when("/entrada/detalle/:filename",{templateUrl:"views/entrada/entrada_detalle.html",controller:"EntradaDetalleCtrl",controllerAs:"entradaDetalle"}).when("/salida",{templateUrl:"views/salida/salida.html",controller:"SalidaCtrl",controllerAs:"salida"}).when("/salida/detalle/:filename",{templateUrl:"views/salida/salida_detalle.html",controller:"SalidaDetalleCtrl",controllerAs:"salidaDetalle"}).otherwise({redirectTo:"/Login"})}]).run(["$rootScope","$location",function(a,b){a.$on("$routeChangeStart",function(c,d){void 0===a.currentUser&&("views/login.html"===d.templateUrl||b.path("/login"))})}]),angular.module("meanApp").controller("LoginCtrl",["$window","$scope","$rootScope","$cookies","$http","md5",function(a,b,c,d,e,f){b.login=function(b){var g={username:b.username,password:f.createHash(b.password)};console.log(g),e.post("http://"+c.serverConfig.host+":"+c.serverConfig.port+"/api/login",g).then(function(b){d.putObject("currentUser",b.data[0]),c.currentUser=b.data[0],a.location.href="/"},function(a){console.error(a)})}}]),angular.module("meanApp").controller("RootCtrl",["$rootScope","$window","$cookies",function(a,b,c){a.serverConfig={host:"localhost",port:3e3},a.distribuidoras=[{alias:"stacomba",code:"0185",name:"Eléctrica de Santa Comba"},{alias:"udesa",code:"0111",name:"UDESA"},{alias:"cabalar",code:"0183",name:"Eléctrica de Cabalar"},{alias:"gayoso",code:"0188",name:"Eléctrica de Gayoso"},{alias:"valdriz",code:"0496",name:"Eléctrica de Valdriz"},{alias:"ccaldelas",code:"0217",name:"Eléctrica de Castro Caldelas"},{alias:"egres",code:"0221",name:"Eléctrica de Gres"},{alias:"mleira",code:"0358",name:"Eléctrica de Martin Leira"},{alias:"ceind",code:"0127",name:"Central Eléctrica Industrial"},{alias:"ezas",code:"0186",name:"Eléctrica de Zas"},{alias:"arnego",code:"0302",name:"Eléctrica de Arnego"},{alias:"efoxo",code:"0193",name:"Eléctrica de Foxo"},{alias:"barcalesa",code:"0555",name:"Eléctrica de Barcalesa"}],a.periodos=[{alias:"Última semana",apiPath:"lastWeek",days:7},{alias:"Últimas dos semanas",apiPath:"lastTwoWeeks",days:15}],a.distrib||(a.distrib=a.distribuidoras[0]);var d=c.getObject("currentUser");d&&(a.currentUser=d),a.logout=function(){delete a.currentUser,c.remove("currentUser"),b.location.href="/"}}]),angular.module("meanApp").controller("DashboardCtrl",["$scope","$rootScope","$http","_",function(a,b,c,d){function e(){b.distrib.alias&&c.get("http://"+b.serverConfig.host+":"+b.serverConfig.port+"/api/query/".concat(b.distrib.alias,"/outputFs.files/",a.period.apiPath)).then(function(a){f(a.data),g(a.data)},function(a){console.log(a)})}function f(b){var c=d.groupBy(b,function(a){return a.metadata.estado||"Sin estado"});a.stateChartLabels=Object.keys(c),a.stateChartColours=i(a.stateChartLabels);var e=[];a.stateChartLabels.forEach(function(a){e.push(c[a].length)}),a.stateChartData=e,a.stateChartType="Pie"}function g(b){var c,e,f,g,j,k=[],l=["REE_CONFIRMADO_OK","REE_CONFIRMADO_BAD2","REE_PDTE_CONFIRMACION","FICHERO_ENVIADO_OK","FICHERO_ENVIADO_ERROR","FICHERO_EXPORTADO_OK"];l.map(function(b){for(var c=[],d=0;d<a.period.days;d++)c.push(0);k.push(c)});var m=d.groupBy(b,function(a){var b=new Date(a.uploadDate),c=b.getDate(),d=b.getMonth()+1;return c+"/"+d});m=h(m);for(c in m){e=d.groupBy(m[c],function(a){return a.metadata.estado||"Sin estado"});for(f in e)l.indexOf(f)<0||(g=l.indexOf(f),j=Object.keys(m).indexOf(c),k[g][j]=e[f].length)}a.evolveStateChartLabels=Object.keys(m),a.evolveStateChartColours=i(l),a.evolveStateChartSeries=l,a.evolveStateChartData=k,a.evolveStateChartOnClick=function(a,b){console.log(a,b)}}function h(b){var c,d,e=new Date,f=new Date,g={};f.setDate(f.getDate()-a.period.days);for(var h=f;e>h;h.setDate(h.getDate()+1))c=h.getDate(),d=h.getMonth()+1,Object.keys(b).indexOf(c+"/"+d)<0?g[c+"/"+d]=[]:g[c+"/"+d]=b[c+"/"+d];return g}function i(a){return a.map(function(a){switch(a){case"REE_CONFIRMADO_OK":return"#00cc00";case"REE_PDTE_CONFIRMACION":return"#cccc00";case"REE_CONFIRMADO_BAD2":return"#cc0000";case"FICHERO_ENVIADO_OK":return"#008000";case"FICHERO_EXPORTADO_OK":return"#cc6600";case"FICHERO_ENVIADO_ERROR":return"#800000";default:return"#fff"}})}a.periodos=[{alias:"Última semana",apiPath:"lastWeek",days:7},{alias:"Últimas dos semanas",apiPath:"lastTwoWeeks",days:15}],a.period=a.periodos[1],a.distribArray=[{codigo:"0111",nombre:"UDESA",reqAtencion:11},{codigo:"0188",nombre:"Eléctrica de Gayoso",reqAtencion:5},{codigo:"0183",nombre:"Eléctrica de Cabalar",reqAtencion:2},{codigo:"0185",nombre:"Eléctrica de Santa Comba",reqAtencion:7},{codigo:"0302",nombre:"Eléctrica de Zas",reqAtencion:1},{codigo:"0655",nombre:"Eléctrica de Valdriz",reqAtencion:12},{codigo:"0432",nombre:"Eléctrica de Foxo",reqAtencion:19}],a.changeDistrib=function(a){b.distrib=b.distribuidoras[a],e()},a.changePeriod=function(b){a.period=a.periodos[b],e()}}]),angular.module("meanApp").controller("AboutCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),angular.module("meanApp").controller("RevficherosCtrl",["$scope","$animate","NgTableParams",function(a,b,c){var d=[{_id:"56b22cf6404ce0e29e079d86",fileName:"CLMAG_0402_0233_201504_20150501.0",fileState:"REE_PDTE_CONFIRMACION",fileType:"LUNCHPOD",uploadDate:"2016-01-22T06:24:34.000Z"},{_id:"56b22cf68d562187af8addfd",fileName:"CLMAG_0402_0463_201504_20150501.0",fileState:"REE_PDTE_CONFIRMACION",fileType:"CYCLONICA",uploadDate:"2014-06-30T12:58:50.000Z"},{_id:"56b22cf6bc68496491f919e4",fileName:"CLMAG_0493_0233_201505_20150501.0",fileState:"REE_PDTE_CONFIRMACION",fileType:"ZENSOR",uploadDate:"2014-11-30T09:40:27.000Z"},{_id:"56b22cf6ad2ed3b1c673760d",fileName:"CLMAG_0402_0233_201504_20150501.1",fileState:"REE_PDTE_CONFIRMACION",fileType:"FARMEX",uploadDate:"2014-12-22T04:35:46.000Z"},{_id:"56b22cf6e8cac06431bc9c4b",fileName:"CLMAG_0402_0233_201504_20150501.2",fileState:"FICHERO_ENVIADO_ERROR",fileType:"SEALOUD",uploadDate:"2014-03-22T03:19:59.000Z"},{_id:"56b22cf605f28d0a66e2f7d8",fileName:"CLMAG_0301_0233_201504_20150501.0",fileState:"REE_PDTE_CONFIRMACION",fileType:"EXOSTREAM",uploadDate:"2014-04-30T10:43:09.000Z"},{_id:"56b22cf622111b0314331298",fileName:"CLMAG_0402_0233_201504_20150501.0",fileState:"FICHERO_ENVIADO_ERROR",fileType:"ENTROFLEX",uploadDate:"2015-03-28T10:06:13.000Z"},{_id:"56b22cf6256f04afa8666d64",fileName:"CLMAG_0402_0233_201504_20150501.0",fileState:"FICHERO_ENVIADO_ERROR",fileType:"AQUAMATE",uploadDate:"2014-03-21T06:22:38.000Z"},{_id:"56b22cf667091f980da4ab9b",fileName:"CLMAG_0402_0233_201504_20150501.0",fileState:"REE_CONFIRMADO_BAD2",fileType:"BOINK",uploadDate:"2015-10-26T09:53:54.000Z"},{_id:"56b22cf637fe84291084cdf3",fileName:"CLMAG_0402_0233_201504_20150501.0",fileState:"FICHERO_ENVIADO_OK",fileType:"TECHTRIX",uploadDate:"2014-01-21T06:17:29.000Z"},{_id:"56b22cf625f466e5b7bccfbd",fileName:"CLMAG_0402_0233_201504_20150501.0",fileState:"FICHERO_ENVIADO_OK",fileType:"EXOBLUE",uploadDate:"2015-12-21T03:53:12.000Z"}];a.tableParams=new c({page:1,count:10},{data:d}),a.datepicker={startDate:new Date(moment().subtract(1,"day")),endDate:new Date(moment().subtract(1,"day"))},a.ranges={Hoy:[moment(),moment()],Ayer:[moment().subtract("days",1),moment().subtract("days",1)],"Últimos 7 días":[moment().subtract("days",7),moment()],"Últimos 30 días":[moment().subtract("days",30),moment()],"Este mes":[moment().startOf("month"),moment().endOf("month")]},a.refreshFileTable=function(){var b=[];d.forEach(function(c){var d=new Date(c.uploadDate);d>=a.datepicker.startDate&&d<a.datepicker.endDate&&b.push(c)}),a.tableParams=new c({page:1,count:10},{data:b})}}]),angular.module("meanApp").controller("AtencionCtrl",["$scope","$http",function(a,b){}]),angular.module("meanApp").controller("EntradaCtrl",["$scope","$rootScope","$http","_","NgTableParams",function(a,b,c,d,e){a.periodos=[{alias:"Última semana",apiPath:"lastWeek"},{alias:"Últimas dos semanas",apiPath:"lastTwoWeeks"},{alias:"Todos los datos",apiPath:"all"}],a.omitTypes={OK:!0,BAD2:!0,BALD:!0},a.idSelectedFile=null,a.period=a.periodos[1],a.changeDistrib=function(c){b.distrib=b.distribuidoras[c],a.refreshTable()},a.changePeriod=function(b){a.period=a.periodos[b],a.refreshTable()},a.selectFile=function(b,c){a.idSelectedFile=c},a.refreshTable=function(){b.distrib.alias&&c.get("http://"+b.serverConfig.host+":"+b.serverConfig.port+"/api/query/".concat(b.distrib.alias,"/inputFs.files/",a.period.apiPath)).then(function(b){var c=b.data.map(function(a){var b=a.filename.split("/"),c=b[b.length-1];return{filename:c,type:a.metadata.fileType,uploadDate:a.uploadDate,sourceParticipant:a.metadata.sourceParticipant}});c=c.filter(function(b){return!a.omitTypes[b.type.toUpperCase()]}),c=d.sortBy(c,function(a){return-new Date(a.uploadDate)}),a.tableParams=new e({page:1,count:25},{data:c})},function(a){console.log(a)})}}]),angular.module("meanApp").controller("EntradaDetalleCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),angular.module("meanApp").controller("SalidaCtrl",["$scope","$rootScope","$http","_","NgTableParams",function(a,b,c,d,e){a.periodos=[{alias:"Última semana",apiPath:"lastWeek"},{alias:"Últimas dos semanas",apiPath:"lastTwoWeeks"},{alias:"Todos los datos",apiPath:"all"}],a.omitStates={FICHERO_ENVIADO_OK:!1,REE_CONFIRMADO_OK:!1},a.period=a.periodos[1],a.changeDistrib=function(c){b.distrib=b.distribuidoras[c],a.refreshTable()},a.changePeriod=function(b){a.period=a.periodos[b],a.refreshTable()},a.refreshTable=function(){b.distrib.alias&&c.get("http://"+b.serverConfig.host+":"+b.serverConfig.port+"/api/query/".concat(b.distrib.alias,"/outputFs.files/",a.period.apiPath)).then(function(b){var c=b.data.map(function(a){var b="";if("interobjedistrib"===a.metadata.fileType.toLowerCase()){var c=a.metadata.exportedFilePath.split("/");b=c[c.length-1]}else b=a.metadata.exportFileName;return{filename:b,state:a.metadata.estado,type:a.metadata.fileType,inputFilename:a.metadata.inputFileName,uploadDate:a.uploadDate,sendResult:a.metadata.resultadoEnvio,sourceParticipant:a.metadata.sourceParticipant}});c=c.filter(function(b){return!a.omitStates[b.state]}),c=d.sortBy(c,function(a){return-new Date(a.uploadDate)}),a.tableParams=new e({page:1,count:25},{data:c})},function(a){console.log(a)})}}]),angular.module("meanApp").controller("SalidaDetalleCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),angular.module("meanApp").run(["$templateCache",function(a){a.put("views/about.html","<p>This is the about view.</p>"),a.put("views/atencion.html","<p>This is the atencion view.</p>"),a.put("views/dashboard.html",'<div ng-controller="DashboardCtrl"> <div class="col-md-12 text-center"> <h3 class="text-center"><label class="label label-default">Mostrando {{distrib.name}}</label></h3> <h4 class="text-center"><label class="label label-default">{{period.alias}}</label></h4> <button class="vert-offset-top-1 btn btn-default" ng-repeat="distrib in distribuidoras" ng-click="changeDistrib($index)">{{distrib.alias|uppercase}}</button> </div> <div class="col-md-12 text-center"> <button class="btn btn-default" ng-repeat="period in periodos" ng-click="changePeriod($index)">{{period.alias}}</button> </div> <div class="vert-offset-top-1 col-md-6"> <div class="panel panel-default"> <div class="panel-heading panel-title text-center"><h5>{{period.alias}}: Estado de ficheros</h5></div> <div class="panel-body"> <canvas id="base" class="chart-base" chart-type="stateChartType" chart-colours="stateChartColours" chart-data="stateChartData" chart-labels="stateChartLabels" chart-legend="true"> </canvas> </div> </div> </div> <div class="vert-offset-top-1 col-md-6"> <div class="panel panel-default"> <div class="panel-heading panel-title text-center"><h5>{{period.alias}}: Evolución de estados</h5></div> <div class="panel-body"> <canvas id="line" class="chart chart-line" chart-data="evolveStateChartData" chart-colours="evolveStateChartColours" chart-labels="evolveStateChartLabels" chart-legend="true" chart-series="evolveStateChartSeries" chart-click="onClick"> </canvas> </div> </div> </div> <div class="vert-offset-top-4 col-md-12 vert-offset-bottom-6"> <div class="col-md-4"> <div class="panel panel-default"> <div class="panel-heading panel-title text-center">Ficheros que requieren atención por distribuidora</div> <div class="panel-body"> <div class="text-center">En construcción</div> <div class="list-group"> <a href="#/atencion/distrib/{{distrib.codigo}}" class="list-group-item" ng-repeat="distrib in distribArray">{{distrib.nombre}}<span class="badge">{{distrib.reqAtencion}}</span></a> </div> </div> </div> </div> <div class="col-md-4"> <div class="panel panel-default"> <div class="panel-heading panel-title text-center">Últimos ficheros de entrada</div> <div class="panel-body text-center">En construcción</div> </div> </div> <div class="col-md-4"> <div class="panel panel-default"> <div class="panel-heading panel-title text-center">Últimas respuestas de REE</div> <div class="panel-body text-center">En construcción</div> </div> </div> </div> </div>'),a.put("views/entrada/detalle.html","<p>This is the detalle view.</p>"),a.put("views/entrada/entrada.html",'<div ng-controller="EntradaCtrl"> <div class="text-center"> <h3><label class="label label-default">Ficheros de Entrada: {{distrib.name}}</label></h3> </div> <div class="col-md-12 text-center vert-offset-top-1"> <div class="btn-group"> <button class="btn btn-default" ng-class="{\'btn-primary\': d === distrib}" ng-repeat="d in distribuidoras" ng-click="changeDistrib($index)">{{d.alias|uppercase}}</button> </div> </div> <div class="col-md-12 text-center"> <div class="btn-group"> <button class="btn btn-default" ng-class="{\'btn-primary\': p === period}" ng-repeat="p in periodos" ng-click="changePeriod($index)">{{p.alias}}</button> </div> </div> <div class="col-md-12 text-center"> <div class="btn-group"> <label class="btn btn-default disabled">Omitir los siguientes tipos</label> <label class="btn btn-default" ng-repeat="(state,value) in omitTypes" ng-change="refreshTable()" ng-model="omitTypes[state]" uib-btn-checkbox>{{state}}</label> </div> </div> <div class="col-md-12 vert-offset-top-2 vert-offset-bottom-6"> <div class="col-md-7" id="tableDiv"> <div class="panel panel-primary"> <div class="panel-heading"><h3 class="panel-title">Registro de entrada</h3></div> <div class="panel-body"> <table ng-table="tableParams" class="table" show-filter="true"> <tr ng-click="selectFile(file, $index)" ng-class="{selected: $index === idSelectedFile}" class="animate" ng-repeat="file in $data"> <td title="\'Nombre\'" filter="{\'filename\': \'text\'}" sortable> <a ng-href="http://{{serverConfig.host}}:{{serverConfig.port}}/api/file/{{distrib.alias}}/{{distrib.code}}/inputFs/{{file.filename}}">{{file.filename}}</a> </td> <!--\n              <td title="\'Tipo\'" filter="{ \'type\': \'text\'}" sortable="\'type\'">\n                  {{file.type | uppercase}}\n              </td>\n              <td title="\'Emisor\'" filter="{ \'sourceParticipant\': \'text\'}" sortable="\'sourceParticipant\'">\n                  {{file.sourceParticipant | uppercase}}\n              </td>\n              --> <td title="\'Fecha\'" filter="{ uploadDate: \'text\'}" sortable> {{file.uploadDate | date:"dd/MM/yyyy \'a las\' HH:mm"}} </td> </tr> </table> </div> </div> </div> <div ng-show="idSelectedFile >= 0" class="col-md-5"> <div class="panel panel-primary"> <div class="panel-heading"><h3 class="panel-title">Linea de tiempo del fichero seleccionado</h3></div> <div class="panel-body timeline"> <dl> <dt>Abril 2015</dt> <dd class="pos-right clearfix"> <div class="circ"></div> <div class="time">14 de Abril</div> <div class="events"> <div class="events-body"> <h4 class="events-heading">Estado X</h4> <p><small class="text-muted"><i class="glyphicon glyphicon-time"></i> hace 11 horas</small></p> <p>Raw denim you probably haven\'t heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua.</p> </div> </div> </dd> <dd class="pos-left clearfix"> <div class="circ"></div> <div class="time">10 de Abril</div> <div class="events"> <div class="events-body"> <h4 class="events-heading">Cambia a estado Y</h4> <p><small class="text-muted"><i class="glyphicon glyphicon-time"></i> hace 4 días</small></p> <p>Raw denim you probably haven\'t heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua.</p> </div> </div> </dd> <dt>Marzo 2015</dt> <dd class="pos-right clearfix"> <div class="circ"></div> <div class="time">15 de Marzo</div> <div class="events"> <div class="events-body"> <h4 class="events-heading">Flat UI</h4> <p><small class="text-muted"><i class="glyphicon glyphicon-time"></i> hace X días</small></p> <p>Raw denim you probably haven\'t heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua.</p> </div> </div> </dd> <dd class="pos-left clearfix"> <div class="circ"></div> <div class="time">8 de Marzo</div> <div class="events"> <div class="events-body"> <h4 class="events-heading">UI design</h4> <p><small class="text-muted"><i class="glyphicon glyphicon-time"></i> hace XX días</small></p> <p>Raw denim you probably haven\'t heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua.</p> </div> </div> </dd> </dl> </div> </div> </div> </div> </div>'),a.put("views/login.html",'<div ng-controller="LoginCtrl"> <div class="vert-offset-top-3"> <div class="col-md-12 text-center vert-offset-bottom-2"> <h3>Concentrador Secundario de UDESA</h3> </div> <div class="col-md-offset-4 col-md-4 col-md-offset-4 vert-offset-bottom-7"> <form name="loginForm" ng-submit="login(user)"> <div class="form-group"> <label for="username">Nombre de usuario</label> <input type="text" class="form-control" id="username" name="username" placeholder="Nombre de usuario" ng-model="user.username" required> <div class="alert alert-danger" ng-show="loginForm.username.$dirty && loginForm.username.$error.required"><label>¡Campo obligatorio!</label></div> </div> <div class="form-group"> <label for="password">Contraseña</label> <input type="password" class="form-control" id="password" name="password" placeholder="Contraseña" ng-model="user.password" required> <div class="alert alert-danger" ng-show="loginForm.password.$dirty && loginForm.password.$error.required"><label>¡Campo obligatorio!</label></div> </div> <button type="submit" class="btn btn-primary btn-lg btn-block" ng-disabled="!loginForm.$valid">Acceder</button> </form> </div> </div> </div>'),a.put("views/revficheros.html",'<div class="row marketing" ng-controller="RevficherosCtrl"> <div class="text-center"> Selecciona una fecha: <input type="daterange" class="btn btn-default dropdown-toggle" ng-model="datepicker" ranges="ranges" ng-change="refreshFileTable()" format="DD MMM YYYY" separator="-"> <h3><label class="label label-default">Visualizando desde el {{datepicker.startDate|date:"dd/MM/yyyy"}} hasta el {{datepicker.endDate|date:"dd/MM/yyyy"}}</label></h3> </div> <table ng-table="tableParams" class="table" show-filter="true"> <tr class="animate" ng-repeat="file in $data"> <td title="\'Nombre\'" filter="{ fileName: \'text\'}" sortable> {{file.fileName}} </td> <td title="\'Tipo\'" filter="{ fileType: \'text\'}" sortable> {{file.fileType}} </td> <td title="\'Fecha de creacion\'" filter="{ uploadDate: \'text\'}" sortable> {{file.uploadDate | date:"dd/MM/yyyy \'a las\' hh:mm a"}} </td> </tr> </table> </div>'),a.put("views/salida/detalle.html","<p>This is the detalle view.</p>"),a.put("views/salida/salida.html",'<div ng-controller="SalidaCtrl"> <div class="text-center"> <h3><label class="label label-default">Ficheros de Salida: {{distrib.name}}</label></h3> </div> <div class="col-md-12 text-center vert-offset-top-1"> <div class="btn-group"> <button class="btn btn-default" ng-class="{\'btn-primary\': d === distrib}" ng-repeat="d in distribuidoras" ng-click="changeDistrib($index)">{{d.alias|uppercase}}</button> </div> </div> <div class="col-md-12 text-center"> <div class="btn-group"> <button class="btn btn-default" ng-class="{\'btn-primary\': p === period}" ng-repeat="p in periodos" ng-click="changePeriod($index)">{{p.alias}}</button> </div> </div> <div class="col-md-12 text-center"> <div class="btn-group"> <label class="btn btn-default disabled">Omitir los siguientes estados</label> <label class="btn btn-default" ng-repeat="(state,value) in omitStates" ng-change="refreshTable()" ng-model="omitStates[state]" uib-btn-checkbox>{{state}}</label> </div> </div> <div class="col-md-12 vert-offset-top-1 vert-offset-bottom-6"> <table ng-table="tableParams" class="table" show-filter="true"> <tr ng-class="{\'green\': file.state === \'NO_REQUIERE_ENVIO\' ||\n                              file.state === \'FICHERO_ENVIADO_OK\' ||\n                              file.state === \'REE_CONFIRMADO_OK\',\n'+"                    'red': file.state === 'REE_CONFIRMADO_BAD2' ||\n                              file.state === 'REE_CONFIRMADO_BAD' ||\n                              file.state === 'FICHERO_ENVIADO_ERROR',\n                    'yellow': file.state === 'REE_PDTE_CONFIRMACION'\n                    }\" class=\"animate\" ng-repeat=\"file in $data\"> <td title=\"'Nombre'\" filter=\"{'filename': 'text'}\" sortable> <a ng-href=\"http://{{serverConfig.host}}:{{serverConfig.port}}/api/file/{{distrib.alias}}/outputFs/{{file.filename}}\">{{file.filename}}</a> </td> <td title=\"'Tipo'\" filter=\"{ 'type': 'text'}\" sortable> {{file.type}} </td> <td title=\"'Estado'\" filter=\"{'state': 'text'}\" sortable> <span ng-if=\"file.state !== 'REE_CONFIRMADO_BAD2'\">{{file.state}}</span> <a class=\"\" ng-if=\"file.state === 'REE_CONFIRMADO_BAD2'\" ng-href=\"http://{{serverConfig.host}}:{{serverConfig.port}}/api/file/{{distrib.alias}}/{{distrib.code}}/inputFs/{{file.filename}}.bad2\">{{file.state}}</a> </td> <td title=\"'Envio'\" filter=\"{'sendResult': 'text'}\" sortable> {{file.sendResult}} </td> <td title=\"'Generado por'\" filter=\"{'inputFilename':'text'}\" sortable> <a ng-href=\"http://{{serverConfig.host}}:{{serverConfig.port}}/api/file/{{distrib.alias}}/{{distrib.code}}/inputFs/{{file.inputFilename}}\">{{file.inputFilename}}</a> </td> <td title=\"'Fecha de subida'\" filter=\"{ uploadDate: 'text'}\" sortable> {{file.uploadDate | date:\"dd/MM/yyyy 'a las' HH:mm\"}} </td> </tr> </table> </div> </div>")}]);