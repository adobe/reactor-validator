#!/usr/bin/env node

/***************************************************************************************
 * (c) 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

const path = require('path');
const validate = require('../lib/index');
const extensionDescriptor = require(path.resolve('extension.json'));
const result = validate(extensionDescriptor);

if (result) {
  console.error(`The extension appears to be malformed: ${result}`);
  process.exitCode = 1;
} else {
  console.log('The extension appears to be well-formed.');
}
