# Adobe Experience Platform Tags Extension Validator

[![npm (scoped)](https://img.shields.io/npm/v/@adobe/reactor-validator.svg?style=flat)](https://www.npmjs.com/package/@adobe/reactor-validator)

Adobe Experience Platform Tags is a next-generation tag management solution enabling simplified deployment of marketing technologies. For more information regarding Tags, please visit our [product website](http://www.adobe.com/enterprise/cloud-platform/launch.html).

The extension validator helps extension developers validate that an extension package is well-structured. Namely, it verifies that:

1. The extension has a [manifest](https://experienceleague.adobe.com/docs/experience-platform/tags/extension-dev/manifest.html?lang=en) (`extension.json`) matching the expected structure.
2. All referenced directories and files exist at the specified locations within the extension directory. The manifest's `viewBasePath` must point to an existing directory (not a file, and not a missing path); at least one file must exist under that path. 

For more information about developing an extension for Tags, please visit our [extension development guide](https://experienceleague.adobe.com/docs/experience-platform/tags/extension-dev/overview.html?lang=en).  

## Usage

This tool is currently integrated and automatically executed within other tools that extension developers typically use, namely the [Extension Sandbox Tool](https://github.com/adobe/reactor-sandbox) and [Extension Packager Tool](https://github.com/adobe/reactor-packager). This is likely sufficient for most extension developers.

### Running the Validator from the Command Line

Before running the validator, you must first have [Node.js](https://nodejs.org/en/) installed on your computer.

Once Node.js is installed, run the validator by executing the following command from the command line within your extension's directory:

```
npx @adobe/reactor-validator
```


### Incorporating the Validator into Other Tools


If you would like to incorporate the validator into your own extension development tools, you may do so by first installing the validator as a dependency inside your tool's project:

```
npm i @adobe/reactor-validator
```

Once it has been installed as a dependency, import the validator and pass it an extension manifest object (this is the object exported from an `extension.json` file). If the value returned from the validator is `undefined`, then the extension appears to be well-formed; otherwise, the value will contain a description of the issue that was encountered.

**Supported import paths:** Only the documented entry points are supported. Deep imports (e.g. `@adobe/reactor-validator/lib/validate`) are not supported and will fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`. Use one of these:

- **Node:** `require('@adobe/reactor-validator')` — scans the filesystem and validates
- **Browser or bundled:** `import validate from '@adobe/reactor-validator/validate'` — validates against a provided file list

```javascript
const validate = require('@adobe/reactor-validator');
const error = validate(require('./extension.json'));

// Will be undefined if no error was found.
console.log(error);
```

### Using the validator in a browser or bundled app

Browser (or other non-Node) consumers should use the `@adobe/reactor-validator/validate` subpath so they do not pull in Node-only code. The default export (`@adobe/reactor-validator`) scans the filesystem and is for Node only.

The `validate` function has the signature `(extensionDescriptor, fileList)`:

- **extensionDescriptor:** The parsed extension manifest (e.g. from `extension.json`).
- **fileList:** An array of relative path strings for every file in the extension package (e.g. from a folder picker or zip). The caller is responsible for gathering this list; the validator only checks that required paths are present.
- **Returns:** `undefined` if valid, or an error string on the first problem found.

```javascript
import validate from '@adobe/reactor-validator/validate';

const error = validate(manifestJson, Array.from(filesMap.keys()));
if (error) {
  console.error(error);
}
```

**Webpack alias for `ajv`:** The `validate` module depends on `ajv-draft-04`, which in turn requires `ajv` and resolves internal paths (e.g. `ajv/dist/core`). If your app does not list `ajv` as a direct dependency, add a resolve alias so the bundler uses the validator's `ajv`:

- Resolve via an **exported** path (e.g. `@adobe/reactor-validator/validate`), not `package.json`, to avoid `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- Alias to the **package directory** of `ajv`, not to `ajv.js`, so subpaths resolve and Watchpack ENOTDIR errors are avoided.

In your webpack config:

```javascript
const path = require('path');

// Inside module.exports or your config object:
resolve: {
  alias: {
    'ajv': path.join(
      path.dirname(path.dirname(require.resolve('@adobe/reactor-validator/validate'))),
      'node_modules',
      'ajv'
    )
  }
}
```

Alternatively, add `ajv` as a direct dependency in your project with the current version used here so the alias is unnecessary. However, this is very brittle. This project reserves the right to use a different version of `ajv` at any time.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](CONTRIBUTING.md) for more information.

To get started:

1. Install [node.js](https://nodejs.org/).
3. Clone the repository.
4. After navigating into the project directory, install project dependencies by running `npm install`.

To manually test your changes, first run the following command from the sandbox tool directory:

```
npm link
```

Then, in a directory containing an extension (any extension you would like to use for testing), run the following command:

```
npx @adobe/reactor-validator
```

Npx will execute the sandbox tool using your locally linked code rather than the code published on the public npm repository.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.

