var
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

app.get('/', function(req, res){
	res.render("room", {
		layout: false
	});
});
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
	var
		username = randomNames[parseInt(Math.random()*12)] + parseInt(Math.random() * 99); //todo: create random username

	// Warn other user that a new user joined the room
	socket.broadcast.emit('message', {
		username: "LOLChat",
		timestamp: new Date(),
		message: '@' + username + ' has joined!'
	});

	// When user sends a message, broadcast it
	socket.on('message', function (data) {
		data.username = username;
		data.timestamp = new Date();
		console.log("Message: " + data.message);
		socket.emit("message", data);
		socket.broadcast.emit("message", data);
	});
});

app.listen(3101);
