/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

// Validates an extension descriptor object against the JSON schema for its platform.
// Portable -- no Node-specific APIs. Safe to use in browser environments.
// Returns undefined if valid, or an error string if not.

'use strict';
var Ajv = require("ajv-draft-04");
var addAJVFormats = require("ajv-formats");

var schemas = {
  web: require('@adobe/reactor-turbine-schemas/schemas/extension-package-web.json'),
  edge: require('@adobe/reactor-turbine-schemas/schemas/extension-package-edge.json'),
  mobile: require('@adobe/reactor-turbine-schemas/schemas/extension-package-mobile.json')
};

var validateJsonStructure = function(extensionDescriptor) {
  var platform = extensionDescriptor.platform;
  if (!platform) {
    return 'the required property "platform" is missing.';
  }
  var extensionDescriptorSchema = schemas[platform];
  if (!extensionDescriptorSchema) {
    return 'unknown platform "' + platform + '".';
  }
  var ajv = new Ajv({ schemaId: 'auto', strict: false });
  addAJVFormats(ajv);
  if (!ajv.validate(extensionDescriptorSchema, extensionDescriptor)) {
    return ajv.errorsText();
  }
};

module.exports = validateJsonStructure;
