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

const NodeEnvironmentModule = require('jest-environment-node');
const NodeEnvironment = NodeEnvironmentModule.default || NodeEnvironmentModule;
const path = require('path');

class TestFileCwdEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.testPath = context.testPath;
    this.originalCwd = process.cwd;
  }


  async setup() {
    await super.setup();
    const testFileDir = path.dirname(this.testPath);

    // Override process.cwd for both outer and VM contexts
    process.cwd = () => testFileDir;
    this.global.process.cwd = () => testFileDir;
  }

  async teardown() {
    // Restore original process.cwd
    process.cwd = this.originalCwd;
    this.global.process.cwd = this.originalCwd;
    await super.teardown();
  }
}

module.exports = TestFileCwdEnvironment;
