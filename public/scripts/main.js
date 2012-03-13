(function ($, lolchat) {


	$(function () {

		var server, currentRoom, serverOptions, $room, roomId, $input, socket;

		$room = $("#room"); // Get the tag containing the room's messages
		$input = $("#messageInput"); //
		roomId = $("#roomId").val() || "welcome"; // Get the id of the current room from a hidden field

		server = new lolchat.Server(serverOptions);

		// Connect ot the server
		server.connect("/", function () {
			// Join the default room
			// The "connect" event occurs many times, so first test if there is
			// already a room created
			if (!currentRoom) {
				currentRoom = server.room(roomId);
				if (currentRoom) {
					currentRoom.join();
					// todo: reset the display and write the message backlog of this room
					currentRoom.on("message", onMessage);
				} else {
					console.log("Failed to create room #" + roomId);
				}
			}
		});

		/**
		 * When a messge received, display it!
		 */
		function onMessage(data) {
			var timestamp, html, output;
			timestamp = new Date(data.timestamp);
			// build each segment of html for the message output
			// todo: Use Dali instead ?
			html = {
				timestamp : "<span class='timestamp'>[" + timestamp.getHours() + ":" + timestamp.getMinutes() + "]</span>",
				username : data.username ? " <span class='username'>@" + data.username + "</span>" : "",
				message : " - <span class='message'>" + data.message + "</span>"
			};

			// Build and output the final message string
			output = "<div class='message'>" + html.timestamp + html.username + html.message + "</div>";
			$room.append(output);

			// Scroll to the bottom of the chat log
			$('html, body').animate({
				scrollTop: $(document).height()
			}, 0);
		}

		$("#messageForm").submit(function () {
			var message;
			message = $input.val(); // Get value from the input
			$input.val(""); // Reset the input
			if (currentRoom) { // If there is a current room connected
				currentRoom.message(message); // send the message
			} else {
				console.error("Not connected! Message not sent.");
			}
			return false;
		});


		$input.focus(); // Put the focus on the input field

	});

})(jQuery, lolchat);

