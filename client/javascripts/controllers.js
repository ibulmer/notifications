angular.module('routerApp', ['routerRoutes', 'directives', 'factories', 'angularMoment', 'apple', 'dropDirective'])
  .controller('mainController', function ($scope) {

})
  .controller('notifications', function ($scope, needsReview) {
    $scope.start = needsReview.reducer();
    //variable that stores formatted user data
    $scope.notifications = needsReview.getNotifications();
    //toggles dropdown menu on and off
    $scope.showDropDown = function() {
      var elm = document.getElementById('dropdown-container');
      if (elm.style.display === "none") {
        elm.style.display = "block";
      } else {
        elm.style.display = "none";
      }
    }
    //function to delete all notifications
    $scope.deleteAll = function(){
      $scope.notifications = needsReview.deleteAllNotifications();
    };
    //delete a single notification
    $scope.deleteOne = function(idArr) {
      needsReview.deleteSingleNotification(idArr, $scope.notifications);
    }
  })
    .filter('mainFilter', function() {
      return function (item) {
        if (item > 0) {
          return item;
        }
      }
    });



