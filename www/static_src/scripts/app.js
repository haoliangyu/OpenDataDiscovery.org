/**
 * import dependencies
 */
import angular from 'angular';
import 'angular-material';
import 'angular-route';
import 'angular-material-data-table';
import 'angular-material-sidemenu';
import 'angular-filter-count-to';
import 'blob-polyfill';
import 'angular-toarrayfilter';

import 'angular-material/angular-material.css';
import 'angular-material-data-table/dist/md-data-table.css';
import 'angular-material-sidemenu/dest/angular-material-sidemenu.css';
import 'font-awesome/css/font-awesome.css';
import 'leaflet/dist/leaflet.css';
import '../styles/app.less';

angular.module('OpenDataDiscovery', [
  'ngMaterial',
  'ngRoute',
  'ngMaterialSidemenu',
  'countTo',
  'angular-toArrayFilter',
  'md.data.table',
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
