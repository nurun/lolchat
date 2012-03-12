var
		rooms = {},
		express = require('express'),
		app = express.createServer(),
		io = require('socket.io').listen(app),
		connect = require('connect'),
		parseCookie = connect.utils.parseCookie,
		MemoryStore = express.session.MemoryStore,
		sessionStore = new MemoryStore();

app.configure(function () {
	app.set("view engine", "dali");
	app.use(express.cookieParser());
	app.use(express.session({
		store: sessionStore,
		secret: '827hf7s62hk00s8763hfbf',
		key: 'express.sid'
	}));

	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});


var Session = require('connect').middleware.session.Session;
io.set('authorization', function (data, accept) {
	// check if there's a cookie header
    if (data.headers.cookie) {
		// if there is, parse the cookie
		data.cookie = parseCookie(data.headers.cookie);
		// note that you will need to use the same key to grad the
		// session id, as you specified in the Express setup.
		data.sessionID = data.cookie['express.sid'];
        // save the session store to the data object
        // (as required by the Session constructor)
        data.sessionStore = sessionStore;
        sessionStore.get(data.sessionID, function (err, session) {
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
});


app.get('/', function(req, res) {
	res.render("room", {
		layout: false
	});
});

app.get('/:room', function(req, res) {
	res.render("room", {
		layout: false,
		room: req.params.room
	});
});

// Factory helper for presences
var presences = {};
function getPresence(sessionId, room) {
	var id = sessionId + '-' + room.id;
	if (!id) return null;
	var presence;
	presence = presences[id]
	if (!presence) {
		presence = presences[id] = new Presence(sessionId, room);
	}
	return presence;
}

function Presence(sessionId, room) {
	this.room = room;
	this.sessionId = sessionId;
}



// Factory helper for rooms
function getRoom(id, options) {
	if (!id) return null;
	var room;
	room = rooms[id]
	if (!room) {
		room = rooms[id] = new Room(id, options);
	}
	return room;
}

/**
 * A chat room
 */
// todo: Fix bug with recurring connection
// todo: create a "user" class and a "presence" class and make sure it keeps/reuse sessions
//
function Room(id, options) {
	// todo: username should be in a user class injected in options
	var
		room = this;

	this.id = id;
	this.socket = io
			.of("/" + this.id)
			.on('connection', onConnect);

	function onConnect(socket) {
		console.log("Connection on room #" + room.id + " with sessionID : " + socket.handshake.sessionID);

		var session = socket.handshake.session;

		if (!session.username) {
			console.log("new username : ", session.username);
			session.username = randomName(); //todo: create random username
			session.save();
		} else {
			console.log("SAME Username : ", session.username);
		}

		socket.emit("message", {
			timestamp: new Date(),
			username: "lolchat",
			isPrivate: true,
			message: "You have joined room #" + room.id
		});

		socket.on("message", onMessage);
		function onMessage(data) {
			console.log("Message: " + data.message);
			data.username = session.username;
			data.timestamp = new Date();
			socket.emit("message", data);
			socket.broadcast.emit("message", data);
		}

		// Warn other user that a new user joined the room
		socket.broadcast.emit('message', {
			username: "LOLChat",
			timestamp: new Date(),
			message: '@' + session.username + ' has joined room #' + room.id
		});

	}

	console.log("Created a new room ", this.id);
}

/*
app.get('/:room', function(req, res){
    res.send('Hello World');
});
*/
function randomName() {
	var randomNames = [
		"BobGraton",
		"ElvisPresley",
		"JohnDoe",
		"BradPitt",
		"JarJarBinks",
		"Madonna",
		"BillClinton",
		"Obama",
		"TomHanks",
		"Cleopatra",
		"Aïbo",
		"Astro",
		"MancheDePelle"
	];
	return randomNames[parseInt(Math.random()*12)] + parseInt(Math.random() * 99);
}



io.sockets.on('connection', function (socket) {
	console.log("Connection with sessionID : " +  socket.handshake.sessionID);
	socket.on("join", onJoin);
});

function onJoin(data, done) {
	var room = getRoom(data.room, {});
	if (room) {
		done(null, {
			room: room.id
		});
		console.log("joined room: ", room.id);
	} else {
		done(new Error("No room to join!"));
	}
}

app.listen(3101);
