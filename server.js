var
		rooms = {},
		express = require('express'),
		app = express.createServer(),
		io = require('socket.io').listen(app);

app.configure(function () {
	app.set("view engine", "dali");
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
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
function Room(id, options) {
	// todo: username should be in a user class injected in options
	var
		room = this;

	this.id = id;
	this.socket = io
			.of("/" + this.id)
			.on('connection', onConnect);

	function onConnect(socket) {
		console.log("Connection on room", room, socket);
		var
			username = randomNames[parseInt(Math.random()*12)] + parseInt(Math.random() * 99); //todo: create random username

		socket.emit("message", {
			timestamp: new Date(),
			username: "lolchat",
			isPrivate: true,
			message: "You have joined room #" + room.id
		});

		socket.on("message", onMessage);
		function onMessage(data) {
			console.log("Message: " + data.message);
			data.username = username;
			data.timestamp = new Date();
			socket.emit("message", data);
			socket.broadcast.emit("message", data);
		}

		// Warn other user that a new user joined the room
		socket.broadcast.emit('message', {
			username: "LOLChat",
			timestamp: new Date(),
			message: '@' + username + ' has joined room #' + room.id
		});

	}

	console.log("Created a new room ", this.id);
}

/*
app.get('/:room', function(req, res){
    res.send('Hello World');
});
*/
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
]

io.sockets.on('connection', function (socket) {

	socket.on("join", onJoin);
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

});

app.listen(3101);
