/**
 * mom is a lolchat middleware to censor bad words.
 * @param message - The original message received
 * @param response - The response message that will be sent back
 * @param env - The execution environment (lolchat app, session)
 * @param next - The callback to hand over control to other middlewares
 */

badWords = [
	"shit",
	"fucking",
	"fucker",
	"fuck",
	"bitch",
	"dick",
	"nigger",
	"cunt",
	"asshole",
	"framework"
];

cleanWords = cleanWords(badWords);

function cleanWords(badwords) {
	var cleaned = [];
	for (var i = 0; i < badWords.length; i = i + 1) {
		cleaned.push(cleanWord(badWords[i]));
	}
	return cleaned;
}

function cleanWord(word) {
	var stars = "**************************************************";
	if (word && word.length > 2) {
		word = word[0] + stars.slice(0, word.length - 2) + word[word.length-1];
	}
	return word;
}

function cleanMessage(message) {
	var cleanMessage = message;
	for (var i = 0; i < badWords.length; i = i + 1) {
		cleanMessage = cleanMessage.replace(new RegExp(badWords[i], "g"), cleanWords[i]);
	}
	return cleanMessage;
}

function middleware(message, response, env, next) {
	//todo: load the list of bad words from the central lolchat config
	response.broadcast.message = cleanMessage(response.broadcast.message);
	response.private.message = cleanMessage(response.private.message);
	next();
}

module.exports.handle = middleware;