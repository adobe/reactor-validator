# @adobe/reactor-validator

Validates a Launch extension package.

## Usage

```javascript
import validate from '@adobe/reactor-validator';

const error = validate(require('./extension.json'));

// Will be undefined if no error was found.
console.log(error);
```
