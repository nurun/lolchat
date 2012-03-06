$(function () {

	var $room = $("#room"),
		$input = $("#messageInput")
		socket = io.connect('http://localhost/');

	$input.focus();

	socket.on('message', function (data) {
		var timestamp, html, output;
		timestamp = new Date(data.timestamp);
		html = {
			timestamp : "<span class='timestamp'>[" + timestamp.getHours() + ":" + timestamp.getMinutes() + "]</span>",
			username : " <span class='username'>@" + data.username + "</span>",
			message : " - <span class='message'>" + data.message + "</span>"
		};
		output = "<div class='message'>" + html.timestamp + html.username + html.message + "</div>";
		$room.append(output);

		$('html, body').animate({
			scrollTop: $(document).height()
		}, 800);
	});

	$("#messageForm").submit(function () {
		var message;
		message = $input.val();
		$input.val("");
		socket.emit("message", {
			message: message
		})

		return false;
	});

})

