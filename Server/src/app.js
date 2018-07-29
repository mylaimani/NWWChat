/*

 */
var http = require('http');
var cors = require('cors');
var io = require('socket.io');
var config = require('../config/config.json');
var path = require('path');

var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var username=null;
var users={};
var keys={};

//Setup the server
var app = express();
const server = http.createServer(app);
const socketIo = io(server);
// Allow CORS
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// For API index page
app.get('/', (req, res) => {
    res.sendFile(path.resolve('public/index.html'));
});
// Start listening
server.listen(process.env.PORT || config.port);
console.log(`Started on port ${config.port}`);

// Setup socket.io
socketIo.on('connection', socket => {
    // User joins
    username = socket.handshake.query.username;

    console.log("Connection :User is connected  "+username);
    console.log("Connection : " +socket.id);
    socket.broadcast.emit('username', username);
    users[username]=socket.id;
    keys[socket.id]=username;

    // message received from client, now broadcast it to everyone else
    socket.on('client:message', data => {
        socket.broadcast.emit('server:message', data);
    });

    // User disconnect
    socket.on('disconnect', () => {
        console.log(keys[socket.id] +' disconnected');
        delete users[keys[socket.id]];
        delete keys[socket.id];
        socket.broadcast.emit('users',users);
        console.log(users);

    });
});

module.exports = app;
