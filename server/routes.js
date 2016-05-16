var arr = require("./notifications.json");

module.exports = function(app, express){
  app.get('/notifications', function(req, res) {
    res.send(arr);
  });
  app.delete('/notifications/all', function(req, res) {
    arr = [];
    res.send(arr);
  });
  app.post('/notification/single', function(req, res) {
    var x = req.body.idArr;
    console.log('x is ', x);
    console.log('notifications are ', arr);
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < x.length; j++) {
        console.log('round ', i);
        console.log('arr [i] ', arr[i]);
        if (arr[i].id === x[j]) {
          console.log('BANG')
          //model deleting data in databse
          result.push(arr.splice(i, 1)[0].id);
          i--;
          break;
        }
      }
    }
    res.send(result);
  })

};