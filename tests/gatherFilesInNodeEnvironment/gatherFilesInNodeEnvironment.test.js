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

describe('gatherFilesInNodeEnvironment', () => {
  let gatherFiles;

  beforeEach(() => {
    jest.resetModules();
    jest.mock('fs', () => ({
      readdirSync: jest.fn(() => ['file.html']),
      statSync: jest.fn(() => ({ isDirectory: () => false }))
    }));
    jest.mock('path', () => ({
      ...jest.requireActual('path'),
      join: jest.fn(),
      relative: jest.fn()
    }));
    gatherFiles = require('../../lib/gatherFilesInNodeEnvironment');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('normalizes Windows backslash paths to forward slashes', () => {
    const path = require('path');
    path.join.mockReturnValue('C:\\ext\\src\\view\\file.html');
    path.relative.mockReturnValue('src\\view\\file.html');

    var result = gatherFiles('C:\\ext');
    expect(result).toEqual(['src/view/file.html']);
  });

  it('returns forward-slash paths unchanged on non-Windows systems', () => {
    const path = require('path');
    path.join.mockReturnValue('/ext/src/view/file.html');
    path.relative.mockReturnValue('src/view/file.html');

    var result = gatherFiles('/ext');
    expect(result).toEqual(['src/view/file.html']);
  });

  it('returns files at the root level with no directory prefix', () => {
    const path = require('path');
    path.join.mockReturnValue('/ext/file.html');
    path.relative.mockReturnValue('file.html');

    var result = gatherFiles('/ext');
    expect(result).toEqual(['file.html']);
  });

  it('recurses into subdirectories', () => {
    const fs = require('fs');
    const path = require('path');

    fs.readdirSync
      .mockReturnValueOnce(['src'])
      .mockReturnValueOnce(['file.html']);
    fs.statSync
      .mockReturnValueOnce({ isDirectory: () => true })
      .mockReturnValueOnce({ isDirectory: () => false });
    path.join
      .mockReturnValueOnce('/ext/src')
      .mockReturnValueOnce('/ext/src/file.html');
    path.relative
      .mockReturnValueOnce('src')
      .mockReturnValueOnce('src/file.html');

    var result = gatherFiles('/ext');
    expect(result).toEqual(['src/file.html']);
  });

  it('returns multiple files', () => {
    const fs = require('fs');
    const path = require('path');

    fs.readdirSync.mockReturnValue(['a.html', 'b.html']);
    fs.statSync.mockReturnValue({ isDirectory: () => false });
    path.join
      .mockReturnValueOnce('/ext/a.html')
      .mockReturnValueOnce('/ext/b.html');
    path.relative
      .mockReturnValueOnce('a.html')
      .mockReturnValueOnce('b.html');

    var result = gatherFiles('/ext');
    expect(result).toEqual(['a.html', 'b.html']);
  });
});
