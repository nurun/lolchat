var
		express = require('express'),
		app = express.createServer(),
		connect = require('connect'),
		MemoryStore = express.session.MemoryStore,
		sessionStore = new MemoryStore(),
		logger = require('winston'),
		lolchat = require('./lolchat');

//
// Setup nconf to use (in-order):
//   1. Command-line arguments
//   2. Environment variables
//   3. A file located at 'path/to/config.json'
//

// Configure the web server to support the lolchat server
app.configure(function () {
	app.set("view engine", "dali");
	app.use(express.cookieParser());
	// The session will be shared with lolchat
	app.use(express.session({
		store: sessionStore,
		//todo: make the secret configurable
		secret: lolchat.get("server:secret"),
		key: 'express.sid'
	}));
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});

// Send a web client preset on the welcome room
app.get('/', function(req, res) {
	res.render("room", {
		layout: false
	});
});

// Send a web client preset on a specific room
app.get('/:room', function(req, res) {
	res.render("room", {
		layout: false,
		room: req.params.room
	});
});

// Configure the lolchat server
var mom = require("./middleware/mom");
lolchat.use(mom);


var port = lolchat.get("server:port");

// Connect the chat server to the web server
lolchat.listen(app, sessionStore);
app.listen(port);

logger.log("info", "lolchat server started on port: " + port);
