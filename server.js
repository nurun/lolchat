var
		express = require('express'),
		app = express.createServer(),
		connect = require('connect'),
		MemoryStore = express.session.MemoryStore,
		sessionStore = new MemoryStore(),
		lolchat = require('./lolchat');

// Configure the web server to support the lolchat server
app.configure(function () {
	app.set("view engine", "dali");
	app.use(express.cookieParser());
	// The session will be shared with lolchat
	app.use(express.session({
		store: sessionStore,
		//todo: make the secret configurable
		secret: '827hf7s62hk00s8763hfbf',
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
var shout = require("./middleware/shout");
lolchat.use(shout);

// Connect the chat server to the web server
lolchat.listen(app, sessionStore);

//todo: make port configurable
app.listen(3101);
