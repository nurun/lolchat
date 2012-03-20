var
		express = require('express'),
		app = express.createServer(),
		connect = require('connect'),
		MemoryStore = express.session.MemoryStore,
		sessionStore = new MemoryStore(),
		logger = require('winston'),
		lolchat = require('./lolchat'),
		RedisStore = require('connect-redis')(express),
		store;

// Configure the web server to support the lolchat server
app.configure(function () {

	store = sessionStore;
	if (lolchat.get("sessionStore") === "redis") {
		logger.log("info", "Staring lolchat with the redis session store.");
		store = new RedisStore({
			host: "127.0.0.1",
			port: "6379",
			db: "lolchat"
		});
	}

	app.set("view engine", "dali");
	app.use(express.cookieParser());
	// The session will be shared with lolchat
	app.use(express.session({
		store: store,
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
lolchat.use(require("./middleware/nick"));
//lolchat.use(require("./middleware/mom"));


var port = process.env.PORT || lolchat.get("server:port");

// Connect the chat server to the web server
lolchat.listen(app, store);
app.listen(port);

logger.log("info", "lolchat server started on port: " + port);
