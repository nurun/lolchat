/*

# About LOLChat Middleware

LOLChat aims to be as extensible and flexible as possible. To achieve this, the server supports the addition of new features through a "middleware" approach. This approach is very much similar to http server middlewares such as connect of JSGI. But instead of processing http requests, it is processing chat "messages". And instead of controlling an http web server, you control a chat server app.

In other words, LOLChat middlewares dont need to think about how the message has come to it or how it will go back to the user. No matter if the message is transported over http and WebSockets or by UDP or by a message queue, the request and response will be the same format.

 */
var lolchat = module.exports = {};

var
		nconf = require('nconf'),
		rooms = require('./rooms'),
		connect = require('connect'),
		Session = connect.middleware.session.Session,
		parseCookie = connect.utils.parseCookie,
		middleware = require("./middleware");

// Setup configuration manager and get/set helpers
lolchat.config = nconf;
lolchat.config
		.argv()
		.env()
		.file({ file: 'config.json' });

lolchat.get = function (key) {
	return this.config.get(key);
};
lolchat.set = function (key, val) {
	return this.config.set(key, val);
};

// Shorthand for middleware usage
lolchat.middleware = middleware;

lolchat.use = function (fn) {
	this.middleware.use(fn);
};

//todo: Find a better way to inject the sessionStore
lolchat.listen = function (app, sessionStore) {
	console.info("lolchat is now listening!");

	lolchat.sessionStore = sessionStore;

	// Connect socket.io to the web server
	var io = require('socket.io').listen(app);
	lolchat.io = io;

	io.set('authorization', onAuthorization);

	io.sockets.on('connection', onConnection);

};

function onConnection(socket) {
	console.info("Connection with sessionID : " +  socket.handshake.sessionID);
	// Handle join requests
	socket.on("join", onJoin);
}

function onJoin(data, done) {
	var room = rooms.getRoom(data.room, {});
	if (room) {
		// Connect the room to its own socket channel
		// todo: See if the .in() room syntax of socket.io would be a better fit
		var socket = lolchat.io.of("/" + room.id);
		// todo: Find a better way for middleware dependency injection
		room.middleware = lolchat.middleware;
		room.listen(socket);
		// Return the room id to the client (could be changed along the way for aliasses or sanitation)
		done(null, {
			room: room.id
		});
		console.info("Joined room: ", room.id);
	} else {
		// Return an error
		// todo: test what format the error is received on the client
		done(new Error("No room to join!"));
	}
}

function onAuthorization (data, accept) {
	// check if there's a cookie header
	if (data.headers.cookie) {
		// if there is, parse the cookie,
		data.cookie = parseCookie(data.headers.cookie);

		// note that you will need to use the same key to grad the
		// session id, as you specified in the Express setup.
		data.sessionID = data.cookie['express.sid'];

		// save the session store to the data object
		// (as required by the Session constructor)
		data.sessionStore = lolchat.sessionStore;
		lolchat.sessionStore.get(data.sessionID, function (err, session) {
			if (err || !session) {
				accept('Error', false);
			} else {
				// create a session object, passing data as request and our
				// just acquired session data
				data.session = new Session(data, session);
				accept(null, true);
			}
		});
	} else {
	   return accept('No cookie transmitted.', false);
	}
}




