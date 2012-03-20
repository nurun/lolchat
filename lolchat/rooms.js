/*

rooms module

 */

var rooms = module.exports = {};

rooms.rooms = {};

// Factory helper for rooms
rooms.getRoom = function getRoom(id, options) {
	if (!id) return null;
	var room;
	room = rooms.rooms[id];
	if (!room) {
		var socket = options.io.of("/" + id);
		room = rooms.rooms[id] = new rooms.Room(id, options);
		room.listen(socket);
		console.log("NEW room!");
	} else {
		console.log("Reuse room!");
	}
	return room;
};

/**
 * A chat room
 */
// todo: Fix bug with recurring connection
// todo: create a "user" class and a "presence" class and make sure it keeps/reuse sessions
//
rooms.Room = function Room(id, options) {
	// todo: username should be in a user class injected in options
	var
		room = this;

	this.id = id;

	this.listen = function(socket) {
		this.socket = socket;
		console.log("Room ", id, " is now listening to socket!");
		socket.on('connection', onConnect);
	};

	function onConnect(socket) {
		console.log("Connection on room #" + room.id + " with sessionID : " + socket.handshake.sessionID);

		var session = socket.handshake.session;


		if (!session.username) {
			session.username = randomName(); //todo: create random username
			session.save();
		}

		// Increment the connection count
		if (!session.connectionCount) {
			session.connectionCount = 1;
		} else {
			session.connectionCount++;
		}


		// If this is the first "act of presence" in this room for this session
		// Tell the user which room he has joined.

		if (session.connectionCount === 1) onFirstConnection();

		// todo: try to find a good pattern to put this in middleware or plugin!
		// maybe if middleware are able to hook events ?
		function onFirstConnection () {
			handleMessage("server", {
				noBroadcast: true,
				message: "Welcome @" + session.username + ", you have joined room #" + room.id
			});
			// Warn other user that a new user joined the room
			handleMessage("server", {
				noPrivate: true,
				message: '@' + session.username + ' has joined!'
			});
		}


		socket.on("message", onMessage);
		function onMessage(message) {
			handleMessage("client", message);
		}

		function handleMessage(source, message) {
			// Determine which "user" sent the mesage according to the source
			// Server message should have no username
			var username = (source === "client") ? session.username : "";

			// Prepare basic response properties for the private answer and broadcast
			var response = {};

			response.private = {
				source: source,
				username: username,
				timestamp: new Date(),
				message: message.message,
				transmit: (message.noPrivate != true)
			};

			response.broadcast = {
				source: source,
				username: username,
				timestamp: new Date(),
				message: message.message,
				transmit: (message.noBroadcast != true)
			};

			var env = {
				room: this,
				session: session
			};

			// Process the message and response with all middlewares
			room.middleware.handle(message, response, env, function (err) {
				//todo: log with loggly/winston lib
				respond(response);
			});
			// persist the session (in case middlewares changed its state)
			session.save();
		}

		// Send the response
		function respond(response) {
			// Re-transmit the response to the room subscribers
			if (response.private.transmit) {
				socket.emit("message", response.private);
			}
			if (response.broadcast.transmit) {
				socket.broadcast.emit("message", response.broadcast);
			}
		}
	}

	console.log("Created a new room ", this.id);
};

/**
 * Obtain a human readable random name with little risk of collisions
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
