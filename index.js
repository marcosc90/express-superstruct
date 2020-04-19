'use strict';

const { superstruct, struct } = require('superstruct');

// Custom error
class ValidationError extends Error { }

function validate(fields, structure = struct) {
	fields = Array.isArray(fields) ? fields : [fields]
	const Schema = structure(...fields);

	return (req, res, next) => {
		const key = Object.keys(req.body || {}).length ? 'body' : 'query'

		const [error, body] = Schema.validate(req[key] || {});

		if (error)
			return next(new ValidationError(error.reason || error.message));

		req[`_${key}`] = req[key];
		req[key] = body;

		return next();

	};

}

module.exports = {
	superstruct,
	struct,
	validate,
	ValidationError
};
