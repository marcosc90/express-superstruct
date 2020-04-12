

# express-superstruct

An express validation middleware that uses [superstruct](https://github.com/ianstormtaylor/superstruct)

- Replaces the incoming `req.body`, `req.query`, with the validated result, original values are kept in`req._body`/`req._query`
- Express error middleware will be executed upon validation error
## Install

```bash
npm install express-superstruct
```

## Usage

```javascript
const { validate } = require('express-superstruct');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// without req.body/req.query filled, nothing will be validated.
app.use(bodyParser.json());

app.post(
	'/item', 
	validate({ title: 'string', stock: 'number' }),
	(req, res, next) => {
		console.log(req.body.title); // I'm a string 100%
		console.log(req.body.stock); // I'm a number 100%
		res.end('ok');
	}
);

app.get(
	'/item', 
	// Number does not work for GET, since everything is a string/array
	// You may need a custom numeric type. (See below)
	validate({ id: 'string' }),
	(req, res, next) => {
		res.end('ok');
	}
);

```


## Advanced usage

Besides [superstruct's](https://github.com/ianstormtaylor/superstruct/blob/master/docs/reference.md#built-in-types) built-in types, you can build custom ones!

```javascript

const { validate, superstruct, struct } = require('express-superstruct');
/* ... */

const types = {
	email: value => isEmail(value),
	passwod: value => validatePassword(value),
	numeric: value => isNumeric(value)
};

const customStruct = superstruct({ types });

const schema = {
	email: 'email', 
	password: 'password',
	captcha: 'boolean?' // Optional field
};

app.post(
	'/login', 
	validate(schema, customStruct),
	(req, res, next) => {
		res.end('ok');
	}
);

app.post(
	'/emails', 
	validate({ emails: ['email'] }, struct),
	(req, res, next) => {
		console.log(req.body.emails); // I'm an array of emails
		res.end('ok');
	}
);
```

You can pass a more complex [Struct](https://github.com/ianstormtaylor/superstruct/blob/master/docs/reference.md#structs) too!

```javascript
const schema = {
	name: 'string & !empty', // !empty may be another custom type!
	emails: struct.optional(['email'])
};

app.post(
	'/user/update', 
	validate(schema, struct),
	(req, res, next) => {
		res.end('ok');
	}
);

/* ... */
```
**Default** values are supported:

```javascript
const schema = [{
	name: 'string & !empty', // !empty may be another custom type!
	emails: struct.optional(['email']),
	foo: struct.optional(['string'])
}, { foo: 'bar' } ];

app.post(
	'/user/update',
	validate(schema, struct),
	(req, res, next) => {
	    // req.body.foo === 'bar' if foo is not send in the request
		res.end('ok');
	}
);

/* ... */
```

## Handling validation error

```javascript
const { validate, ValidationError } = require('express-superstruct');
const express = require('express');
const app = express();

app.post(...);

app.use((err, req, res, next) => {

	// If you want to set a custom error
	if(err instanceof ValidationError) {
		return res
			.status(400)
			.json({ message: err.message }); // Superstruct's verbose message
	}

});
```