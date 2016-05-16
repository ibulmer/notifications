angular.module('factories', [])
  .factory('needsReview', function($http) {
    function getNotifications() {
      var maDate = moment("2016-03-23T11:50:39.000-00:01").unix();
      var results = [];
      //will store the 3 types of notifications: total assessments, pain notifications, exercise trouble
      var notifications = {
        'assessments' : {},  //format is {patient_id: {name: patient name, timestamp: [timestamp1, timestamp2...], count: number}}
        'pain' : {},  //format is {patient_id: {therapy_sessions: {therapy_session_id: {'name': patient name, timestamp: [timestamp1..., timestampn], total: number, max_pain: number}}}}
        'trouble' : {}, //format is {patient_id: {id : {name: patient_name, timestamp: [timestamp], message: message}}}
      };
      $http({
        method: 'GET',
        url: '/notifications'
      }).then(function(data) {
        datum = data.data;
        console.log('datum is ', data);
        for (var i=0; i<datum.length; i++) {
          //check if the type of session is assessment_needs_review
          if (datum[i].type === 'assessment_needs_review') {
            notifications.assessments[datum[i].patient_id] = notifications.assessments[datum[i].patient_id] || {
                name : datum[i].patient_name,
                timestamp : [],
                count : 0,
                message : datum[i].message,
                ids : [],
                type : datum[i].type,
              }
            notifications.assessments[datum[i].patient_id].count++;
            notifications.assessments[datum[i].patient_id].timestamp.push(moment(datum[i].timestamp));
            notifications.assessments[datum[i].patient_id].ids.push(datum[i].id);
          }

          //check if the type of session is event_pain
          if (datum[i].type === 'event_pain') {
            //check if the patient id exists, if not create it
            notifications.pain[datum[i].patient_id] = notifications.pain[datum[i].patient_id] || {therapy_sessions: {}};
            //check if the therapy session exists, if not create it
            notifications.pain[datum[i].patient_id].therapy_sessions[datum[i].therapy_session_id] = notifications.pain[datum[i].patient_id].therapy_sessions[datum[i].therapy_session_id] || {
              name : datum[i].patient_name,
              total : 0,
              max_pain : datum[i].pain_value,
              timestamp : [],
              ids : [],
              type : datum[i].type,
            }
            notifications.pain[datum[i].patient_id].therapy_sessions[datum[i].therapy_session_id].total ++ ;
            notifications.pain[datum[i].patient_id].therapy_sessions[datum[i].therapy_session_id].timestamp.push(moment(datum[i].timestamp));
            notifications.pain[datum[i].patient_id].therapy_sessions[datum[i].therapy_session_id].ids.push(datum[i].id);
            //if the pain value exceeds maximum pain value update it with the new value
            if (datum[i].pain_value > notifications.pain[datum[i].patient_id].therapy_sessions[datum[i].therapy_session_id].max_pain) {
              notifications.pain[datum[i].patient_id].therapy_sessions[datum[i].therapy_session_id].max_pain = datum[i].pain_value;
            }
          }

          //check if type equals exercise_trouble
          if (datum[i].type === 'exercise_trouble') {
            //check if patient exists
            notifications.trouble[datum[i].patient_id] = notifications.trouble[datum[i].patient_id] || {};
            notifications.trouble[datum[i].patient_id][datum[i].id] = {
              name : datum[i].patient_name,
              timestamp : [moment(datum[i].timestamp)],
              message : datum[i].message,
              ids : [datum[i].id],
              type : datum[i].type,
            }
          }
        }
        //loop through assessments pushing each assessment group into results;
        for (var patient in notifications.assessments) {
          results.push(notifications.assessments[patient]);
        }
        //loop through pain pushing each pain therapy session into results
        for (var patient_id in notifications.pain) {
          for (var therapy_sessions in notifications.pain[patient_id].therapy_sessions) {
            results.push(notifications.pain[patient_id].therapy_sessions[therapy_sessions]);
          }
        }
        //loop through trouble pushing each trouble notification into results
        for (var patient_id in notifications.trouble) {
          for (var id in notifications.trouble[patient_id]) {
            results.push(notifications.trouble[patient_id][id])
          }
        }
        //sort review timestamps, oldest first. Also add a message.
        for (var patient_id in notifications.assessments) {
           notifications.assessments[patient_id].timestamp.sort(function(a, b) {
            return moment(a).unix() - moment(b).unix();
          })
        }
        // sort pain timestamps, oldest first
        for (var patient_id in notifications.pain) {
          for (var therapy_session_id in notifications.pain[patient_id].therapy_sessions) {
            notifications.pain[patient_id].therapy_sessions[therapy_session_id].timestamp.sort(function(a, b) {
              return moment(a).unix() - moment(b).unix();
            })
          }
        }
      console.log('results ', results);
      })
      return results
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
    }

    return {
      getNotifications: getNotifications,
      deleteAllNotifications: deleteAllNotifications,
      deleteSingleNotification: deleteSingleNotification,
      reducer: reducer,
    }
  })

