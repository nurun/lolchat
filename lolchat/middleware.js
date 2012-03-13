/*

middleware module

 */
var middleware = module.exports = {};


middleware.middlewares = []; // Array containing all middlewares in use

/**
 * Add a middle for usage by the server
 * @param middleware
 */
middleware.use = function (middleware) {

	// If middleware is an object with a handle instead of just a function
	// expose the handle function
	if ('function' == typeof middleware.handle) {
		var server = middleware;
		middleware = function(req, res, next){
			server.handle(req, res, next);
		};
	}

	// add the middleware
	this.middlewares.push({
		handle: middleware
	});

};

/**
 * Handle a request by passing through the stack of middlewares
 * @param messageIn
 * @param messageOut
 * @param out
 */
middleware.handle = function (req, res, env, out) {
	var
			middlewares = this.middlewares,
			index = 0;

	function next(err) {
		var middleware = middlewares[index++];

		// If no more middlewares are available
		if (!middleware) {
			// delegate to parent if needed
			if (out) return out(err);

			// If an error has occured
			if (err) {
				// Pass on the error to the response
				// todo: format the error in a "json" friendly way
				res.error = err;
			} else {
				res.error = null;
			}
			return;
		}


		try {

			// Pass on the error, request, response and next callback as arguments
			// depending on the argument count
			var arity = middleware.handle.length;
			if (err) {
				if (arity === 4) {
					middleware.handle(err, req, res, env, next);
				} else {
					next(err);
				}
			} else if (arity < 4) {
				middleware.handle(req, res, env, next);
			} else {
				next();
			}
		} catch (e) {
			next(e);
		}
	}

	next();
};

