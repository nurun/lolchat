/**
 * nick is a lolchat middleware to support the /nick command.
 * @param message - The original message received
 * @param response - The response message that will be sent back
 * @param env - The execution environment (lolchat app, session)
 * @param next - The callback to hand over control to other middlewares
 */

//todo: test if nickname isnt already used
//todo: allow for nickname reservations (with password?)
//todo: sanitize the nickname string
//todo: strip the leading "@" if present
//todo: show help if command is used alone
//todo: return error message if nick is not valid
//todo: only accept nicks of 2 or more characters
//todo: strip strings
//todo: should be processed by a special "command" middleware detection first!

function middleware(message, response, env, next) {
	var split, newNick, oldNick;
	var msg = message.message;

	if (msg.slice(0, 6) === "/nick ") {
		// get the new nickname from the command
		split = msg.split(" ");
		if (split.length > 1) {
			newNick = split[1];
		}
		oldNick = env.session.nickname;
		// Store the new nick in the session
		env.session.username = newNick;

		// Set broadcast and private to system messages
		response.broadcast.source = "system";
		response.broadcast.nickname = "";
		response.private.source = "system";
		response.private.nickname = "";
		if (oldNick !== newNick) {
			response.broadcast.message = "User @" + oldNick + " has changed his nick to @" + newNick;
			response.private.message = "Your nick is changed to @" + newNick;
		} else {
			response.broadcast.transmit = false;
			response.private.message = "Your nick didn't change!";
		}
	}
	next();
}

module.exports.handle = middleware;