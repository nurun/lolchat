(function (globals) {

	var
			EventEmitter = globals.EventEmitter,
			tape = globals.tape,
			io = globals.io;

	function Server(options) {
		tape(EventEmitter).to(this);
		this.url = "";
		this.rooms = {};
		this.socket = null;

		/**
		 * Connect to a remote server.
		 */
		this.connect = function (url, callback) {
			this.url = url;
			this.socket = io.connect(url); // Create a connection with socket.io

			this.socket.on('connect', function() {
				callback();
			});
			return this;
		};

		/**
		 * Return an existing or newly created room object.
		 * Room is stored in the "joinedRoom" collection
		 * @param id
		 */
		this.room = function (id, options) {
			if (!id) return null;
			var room = this.rooms[id]; // Try to find the room in the list of existing rooms
			return room || new Room(id, this, options); // Return the found room or create a new one
		};

		this.join = function (room, callback) {
			this.socket.emit("join", { room: room.id }, onJoin);
			function onJoin(err, data) {
				if (err) {
					callback(err);
				} else {
					room.id = data.room; // get the correct roomId from server
					room.socket = io.connect('/' + room.id); // create a socket for this room
					callback(null, room);
				}
			}
			return this;
		};

		this.message = function (room, message) {
			if (room) {
				room.socket.emit("message", {
					room: room.id,
					message: message
				});
				console.log("Message sent to room #" + room.id +" : ", message);
			} else {
				this.socket.emit("message", {
					message: message
				});
				console.log("Message sent in lobby : ", message);
			}
			return this;
		}
	}

	/**
	 * Room connected to the server on a distinct channel
	 * @param id
	 * @param options
	 */
	function Room(id, server, options) {
		tape(EventEmitter).to(this);
		var room = this;

		this.id = id;
		this.server = server;
		this.messages = [];

		/**
		 * Join a room
		 */
		this.join = function (callback) {
			this.server.join(this, onJoin);
			function onJoin(err, data) {
				if (err) {
					console.error("Failed to join room #" + room.id, err);
					callback && callback(err);
				} else {
					console.log("Joined room ", "#" + room.id, room);
					room.socket.on('message', function (data) {
						room.emit("message", data)
					});
					callback && callback(null, room);
				}
			}
			return this;
		};

		/**
		 * Post a message in the room
		 */
		//todo: test first if the user has joined the room
		this.message = function (message) {
			this.server.message(this, message);
			return this;
		};

		/**
		 * Leave the loom
		 */
		//todo: stop receiving messages if user has left the room
		this.leave = function () {
			this.server.socket.emit("leave", { room: this.id }, onLeave);
			return this;
		};
	}

	// Create the lolchat api namespace
	var lolchat = {
		Server: Server,
		Room: Room
	};

	// Export the lolchat api
	globals.lolchat = lolchat;

})(this);
