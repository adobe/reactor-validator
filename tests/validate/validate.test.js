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

// Tests for the portable validate subpath export (validate.js).

const validate = require('../../lib/validate');
const { fromJS } = require('immutable');
const webManifest = require('../web/extension.json');
const edgeManifest = require('../edge/extension.json');

describe('portable validate', () => {
  describe('schema validation', () => {
    it('returns undefined for a valid web descriptor', () => {
      var fileList = ['src/view/.gitkeep'];
      expect(validate(fromJS(webManifest).toJS(), fileList)).toBeUndefined();
    });

    it('returns undefined for a valid edge descriptor', () => {
      var fileList = ['src/view/.gitkeep'];
      expect(validate(fromJS(edgeManifest).toJS(), fileList)).toBeUndefined();
    });

    it('returns an error for an invalid descriptor', () => {
      var bad = fromJS(webManifest).toJS();
      delete bad.name;
      var fileList = ['src/view/.gitkeep'];
      expect(typeof validate(bad, fileList)).toBe('string');
    });

    it('returns an error for unknown platform', () => {
      var bad = fromJS(webManifest).toJS();
      bad.platform = 'unknown';
      var fileList = ['src/view/.gitkeep'];
      expect(validate(bad, fileList)).toBe('unknown platform "unknown".');
    });
  });

  describe('file validation', () => {
    it('returns undefined when viewBasePath is a directory (has files under it)', () => {
      var manifest = fromJS(webManifest).toJS();
      var fileList = ['src/view/.gitkeep'];
      expect(validate(manifest, fileList)).toBeUndefined();
    });

    it('returns an error when viewBasePath is a file', () => {
      var manifest = fromJS(webManifest).toJS();
      manifest.viewBasePath = 'src/view/config.html';
      var fileList = ['src/view/config.html'];
      expect(validate(manifest, fileList)).toBe('The referenced viewBasePath src/view/config.html is either not a directory or is empty.');
    });

    it('returns an error when a required file is missing', () => {
      var manifest = fromJS(webManifest).toJS();
      manifest.main = 'src/lib/main.js';
      var fileList = ['src/view/.gitkeep'];
      expect(validate(manifest, fileList)).toContain('is not a file');
    });

    it('returns an error when viewBasePath is set but no files exist under it', () => {
      var manifest = fromJS(webManifest).toJS();
      var fileList = ['extension.json'];
      expect(validate(manifest, fileList)).toBe('The referenced viewBasePath src/view/ is either not a directory or is empty.');
    });
  });
});
