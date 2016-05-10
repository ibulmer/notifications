angular.module('routerRoutes', ['ngRoute'])

.config(function ($routeProvider, $locationProvider) {
  $routeProvider

.when('/Ash Test', {
  templateUrl : '/views/userpages/ash.html',
  controller: 'user',
  controllerAs: 'user',
})
  $locationProvider.html5Mode(true);
})





