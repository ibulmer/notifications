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
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < x.length; j++) {
        if (arr[i].id === x[j]) {
          //model deleting data in databse
          result.push(arr.splice(i, 1)[0].id);
          i--;
        }
      }
    }
    res.send(result);
  })

};