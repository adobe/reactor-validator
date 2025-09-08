/***************************************************************************************
 * (c) 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

const {
  assertValidManifest,
  assertInvalidManifest
} = require('../helpers/validator-helpers');
const immutable = require('immutable');
const defaultManifest = require('./extension.json');

let testManifest;

beforeEach(() => {
  testManifest = immutable.fromJS(defaultManifest).toJS();
});

it('has the expected platform', () => {
  expect(testManifest.platform).toBe('edge');
});

it('has a valid manifest', () => {
  assertValidManifest(testManifest);
});

describe('releaseNotesUrl', () => {
  it('accepts a valid URL', () => {
    testManifest.releaseNotesUrl = 'https://example.com/';
    assertValidManifest(testManifest);
  });

  it('fails as a string that is not a url', () => {
    testManifest.releaseNotesUrl = 'this should fail';
    assertInvalidManifest(testManifest);
  });

  it('fails as a non-string that is not a url', () => {
    testManifest.releaseNotesUrl = 100;
    assertInvalidManifest(testManifest);
  });
});
