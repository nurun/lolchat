
// Factory helper for presences
var presences = {};
function getPresence(sessionId, room) {
	var id = sessionId + '-' + room.id;
	if (!id) return null;
	var presence;
	presence = presences[id];
	if (!presence) {
		presence = presences[id] = new Presence(sessionId, room);
	}
	return presence;
}

function Presence(sessionId, room) {
	this.room = room;
	this.sessionId = sessionId;
}


