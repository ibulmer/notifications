angular.module('apple', ['notificationFactory', 'notificationDirective'])
  .controller('notificationController', function ($scope, review) {
    $scope.showDropDown = function() {
      var elm = document.getElementById('dropdown-container');
      if (elm.style.display === "none") {
        elm.style.display = "block";
      } else {
        elm.style.display = "none";
      }
    }
    $scope.notifications = review.reducer();
    $scope.logger = function() {console.log($scope.notifications)};
       //function to delete all notifications
    $scope.deleteAll = function(){
      $scope.notifications = review.deleteAllNotifications();
    };
    //delete a single notification
    $scope.deleteOne = function(idArr) {
      review.deleteSingleNotification(idArr, $scope.notifications);
    }
})