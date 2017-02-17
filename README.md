# extension-support-validator

Validates an extension package.

## Usage

```javascript
import validate from '@reactor/extension-support-validator';

const error = validate(require('./extension.json'));

// Will be undefined if no error was found.
console.log(error);
```
