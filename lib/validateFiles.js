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

// Validates that files referenced by an extension descriptor exist in a provided file list.
// Portable -- no Node-specific APIs. Safe to use in browser environments.
// Accepts (extensionDescriptor, fileList) where fileList is an array of relative path strings.
// Returns undefined if valid, or an error string if not.

'use strict';

var stripQueryAndAnchor = function(path) {
  return path.split('?').shift().split('#').shift();
};

var joinPath = function() {
  return [].slice.call(arguments).filter(Boolean).join('/').replace(/\/+/g, '/');
};

var validateViewBasePath = function(extensionDescriptor, fileSet) {
  var viewBasePath = extensionDescriptor.viewBasePath;
  if (viewBasePath && fileSet.has(viewBasePath.replace(/\/+$/, ''))) {
    return viewBasePath + ' is not a directory.';
  }
};

var validateFileList = function(extensionDescriptor, fileSet) {
  var paths = [];
  var platform = extensionDescriptor.platform;
  var viewBase = extensionDescriptor.viewBasePath;

  if (!platform) {
    return 'the required property "platform" is missing.';
  }

  if (extensionDescriptor.main) {
    paths.push(extensionDescriptor.main);
  }

  if (extensionDescriptor.configuration) {
    paths.push(joinPath(viewBase, stripQueryAndAnchor(extensionDescriptor.configuration.viewPath)));
  }

  ['events', 'conditions', 'actions', 'dataElements'].forEach(function(type) {
    var features = extensionDescriptor[type];
    if (features) {
      features.forEach(function(feature) {
        if (feature.viewPath) {
          paths.push(joinPath(viewBase, stripQueryAndAnchor(feature.viewPath)));
        }
        if (platform === 'web') {
          paths.push(feature.libPath);
        }
      });
    }
  });

  for (var i = 0; i < paths.length; i++) {
    if (!fileSet.has(paths[i])) {
      return paths[i] + ' is not a file.';
    }
  }
};

module.exports = function(extensionDescriptor, fileList) {
  var fileSet = new Set(fileList);
  var validators = [validateViewBasePath, validateFileList];
  for (var i = 0; i < validators.length; i++) {
    var error = validators[i](extensionDescriptor, fileSet);
    if (error) return error;
  }
};
