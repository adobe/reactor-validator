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

// Recursively scans a directory and returns an array of relative file path strings.
// Node-only -- uses fs and path. Not suitable for browser environments.
//
// Example: for an extension layout like
//   extension.json
//   src/view/configuration.html
//   src/view/events/click.html
//   src/lib/main.js
// the returned array is e.g.
//   ['extension.json', 'src/view/configuration.html', 'src/view/events/click.html', 'src/lib/main.js']

'use strict';
var fs = require('fs');
var pathUtil = require('path');

var gatherFilesInNodeEnvironment = function(dir, root, result) {
  root = root || dir;
  result = result || [];
  var entries = fs.readdirSync(dir);
  entries.forEach(function(entry) {
    var fullPath = pathUtil.join(dir, entry);
    var relPath = pathUtil.relative(root, fullPath);
    if (fs.statSync(fullPath).isDirectory()) {
      gatherFilesInNodeEnvironment(fullPath, root, result);
    } else {
      result.push(relPath.replace(/\\/g, '/'));
    }
  });
  return result;
};

module.exports = gatherFilesInNodeEnvironment;
