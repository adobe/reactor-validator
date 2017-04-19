# @adobe/reactor-validator

[![npm (scoped)](https://img.shields.io/npm/v/@adobe/reactor-validator.svg?style=flat)](https://www.npmjs.com/package/@adobe/reactor-validator)

Validates a Launch extension package.

## Usage

```javascript
import validate from '@adobe/reactor-validator';

const error = validate(require('./extension.json'));

// Will be undefined if no error was found.
console.log(error);
```
