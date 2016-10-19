/**
 * import dependencies
 */
import 'fullpage.js';
import angular from 'angular';
import 'angular-material';
import 'angular-route';
import 'angular-material-data-table';
import 'angular-material-sidemenu';
import 'angular-filter-count-to';
import 'angular-fullpage.js';

require('../styles/app.less');
require('../../../node_modules/angular-material/angular-material.css');
require('../../../node_modules/angular-material-data-table/dist/md-data-table.css');
require('../../../node_modules/angular-material-sidemenu/dest/angular-material-sidemenu.css');
require('../../../node_modules/font-awesome/css/font-awesome.css');
require('../../../node_modules/leaflet/dist/leaflet.css');
require('../../../node_modules/fullpage.js/jquery.fullPage.css');

angular.module('OpenDataDiscovery', [
  'ngMaterial',
  'ngRoute',
  'ngMaterialSidemenu',
  'countTo',
  'md.data.table',
  'fullPage.js'
])
.config(function($routeProvider, $locationProvider, $mdThemingProvider) {
  $routeProvider.when('/', {
    templateUrl: 'index.html',
    controller: 'appCtrl'
  });

  // configure html5 to get links working on jsfiddle
  $locationProvider.html5Mode(true);

  // set the theme of angular material
  $mdThemingProvider.theme('default')
    .warnPalette('red')
    .accentPalette('blue');
});

function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context('./services/', true, /\.js$/));
requireAll(require.context('./controllers/', true, /\.js$/));
requireAll(require.context('./directives/', true, /\.js$/));
