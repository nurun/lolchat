
/**
 * Tape object trait to another
 * Simplest way for an object instance to implement the traits of another class
 * Allows inheritance similar to traits and mixxins but in a "functionnal" way.
 * @author: Mathieu Sylvain
 * @param obj
 *
 * Usage:
 *   tape(dogInstants).with(MammalClass)
 */
function tape(obj) {
	/**
	 * Copy traits from a source constructor to the target instance
	 * @param source
	 */

	function and(obj) {
		this.objects.push(obj);
		return this;
	}

	function to(target) {
		// Iterate through each source objects
		for (var i = 0; i < this.objects.length; i = i + 1) {
			tapeTogether(this.objects[i], target);
		}
		// Return the object
		return target;
	}

	function tapeTogether(source, target) {
		// Apply the constructor to the target object
		source.apply(target);
		// Copy each members of the prototype on the
		for (var trait in source.prototype) {
			target[trait] = source.prototype[trait];
		}
	}

	return {
		"objects": [obj],
		"to": to,
		"and": and
	}
}


/*

	Sample usage...

	function Dog () {
		// Get traits from an EventEmitter to the dog
		tape(EventEmitter).to(this);
		this.poke = function () {
			this.emit("poke");
		}
	}

	var dog = new Dog();

	dog.on("poke", function () {
		console.log("bark!");
	});

	dog.poke();

*/
