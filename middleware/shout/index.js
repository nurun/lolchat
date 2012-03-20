/**
 * A sample middleware for LOLChat. It simply capitalize the response messages!
 * @param message - The original message received
 * @param response - The response message that will be sent back
 * @param env - The execution environment (lolchat app, session)
 * @param next - The callback to hand over control to other middlewares
 */
function shout(message, response, env, next) {
	response.broadcast.message = response.broadcast.message.toUpperCase();
	response.private.message = response.private.message.toUpperCase();
	next();
}

module.exports.handle = shout;