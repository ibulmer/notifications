angular.module('directives', [])
  .directive('navbar', function() {
    return {
      templateUrl: 'navbar.html',
    }
  })
  .directive('dropdown', function() {
    return {
      templateUrl: 'dropdown.html',
    }
  })
  .directive('needreview', function() {
    return {
      templateUrl: 'notificationtypes/needreview.html',
    }
  })
  .directive('pain', function() {
    return {
      templateUrl: 'notificationtypes/pain.html',
    }
  })
  .directive('trouble', function() {
    return {
      templateUrl: 'notificationtypes/trouble.html',
    }
  })

