angular.module('notificationFactory', [])
  .factory('review', function($http) {
    function reducer () {
      var result = [];
      $http({
        method: 'GET',
        url: '/notifications',
      }).then(function(data) {
        var datum = data.data;
        //storage will hold references to the index of the reduced array.
        var storage = {};
        datum.reduce(function(comp, item) {
          if (item.type === 'assessment_needs_review' && storage[item.patient_id + item.type] !== undefined || item.type === 'event_pain' && storage[item.therapy_session_id + item.type] !== undefined) {
            var index = storage[item.therapy_session_id + item.type] || storage[item.patient_id + item.type];
            comp[index].ids.push(item.id);
            comp[index].count++;
            if (moment(item.timestamp).unix() < moment(comp[index]).unix() ) {
              comp[index].time = item.timestamp;
            }
            if (item.pain_value >  comp[index].pain) {
              console.log('item pain is ', item.pain);
              comp[index].pain = item.pain_value;
            }
            if (item.type === 'assessment_needs_review') {
              comp[index].message = "Has " + comp[index].count + " messages ready to review";
            }
            if (item.type === 'pain') {
              comp[index.message] = "Reported pain " + comp[index].count + " with highest pain " + comp[index].pain;
            }
          } else {
            comp.push({
              name: item.patient_name,
              message: item.message,
              time: item.timestamp,
              type: item.type,
              count: 1,
              ids: [item.id]
            })
            if (item.pain_value) {
              comp[comp.length-1].pain = item.pain_value;
            }
            if (item.type === 'assessment_needs_review') {
              storage[item.patient_id + item.type] = storage[item.patient_id + item.type] = comp.length -1;
            }
            if (item.type === 'event_pain') {
              storage[item.therapy_session_id + item.type] = comp.length - 1;
            }
          }
          return comp;
        }, result);
        console.log('result is ', result);
      });
      return result;
    }
    //function to delete every notification
    function deleteAllNotifications() {
      var result = [];
      $http.delete('/notifications/all').success(function(data, status, headers, config) {
        result = data;
      });
      return result;
    }

    //helper function to check if object contains any of the ids
    function idMatch(obj, ids) {
      outer:
      for (var i = 0; i < obj.ids.length; i++) {
        for (var j = 0; j < ids.length; j++) {
          if (obj.ids[i] === ids[j]) {
            return true
          }
        }
      }
      return false;
    }

    function deleteSingleNotification(idArr, arrayToRemove) {
      $http.post('/notification/single', {'idArr': idArr}).then(function (data) {
        for (var i = 0; i < arrayToRemove.length; i++) {
          //if there is a match, remove the element;
          if (idMatch(arrayToRemove[i], idArr)) {
            arrayToRemove.splice(i, 1);
            i--;
          }
        }
      });
    };
    return {
      reducer: reducer,
      deleteAllNotifications: deleteAllNotifications,
      deleteSingleNotification: deleteSingleNotification,

    }
  });