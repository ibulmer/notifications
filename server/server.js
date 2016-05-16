var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/../client'));
app.use(express.static(__dirname + '/../client/views'));
app.use(express.static(__dirname + '/../client/notificationitems'));
app.use(express.static(__dirname + '/../client/notificationscontainer'));
app.use(express.static(__dirname+'/../node_modules'));

var server = app.listen(port);
require('./routes.js')(app, express);
