angular.module('routerApp', ['routerRoutes', 'directives', 'factories', 'angularMoment',])
  .controller('mainController', function ($scope) {

})
  .controller('notifications', function ($scope, needsReview) {
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
  .controller('userController', function(){
    //user controller logic would go here
  })
    .filter('mainFilter', function() {
      return function (item) {
        if (item > 0) {
          return item;
        }
      }
    });



