/***************************************************************************************
 * (c) 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

// Validates an extension descriptor against its JSON schema and a provided file list.
// Portable -- no Node-specific APIs. Safe to use in browser environments.
// Accepts (extensionDescriptor, fileList) where fileList is an array of relative path strings.
// Returns undefined if valid, or an error string on the first problem encountered.

'use strict';
var validateSchema = require('./validateSchema');
var validateFiles = require('./validateFiles');

module.exports = function(extensionDescriptor, fileList) {
  var error = validateSchema(extensionDescriptor);
  if (error) return error;

  error = validateFiles(extensionDescriptor, fileList);
  if (error) return error;
};
