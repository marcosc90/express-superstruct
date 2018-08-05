'use strict';

const { superstruct, struct } = require('superstruct');

// Custom error
class ValidationError extends Error {}

function validate(fields, structure = struct) {

	console.log(structure === struct);
	const Schema = structure(fields);

	return (req, res, next) => {

		const data = Object.keys(req.body || {}).length ? req.body : req.query;

		const [error] = Schema.validate(data || {});

		if(error)
			return next(new ValidationError(error.reason || error.message));

		return next();

	};

}

module.exports = {
	superstruct,
	struct,
	validate,
	ValidationError
};
