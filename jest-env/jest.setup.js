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

beforeEach(() => {
  expect(typeof global.process).toBe('object');
  const vmProcessCwd = global.process.cwd();
  expect(vmProcessCwd).toBe(process.cwd());

  /************** These logs can be used to verify process.cwd() behavior **************/
  // this logs process.cwd() from the outer environment (real process)
  // console.log('outer process.cwd:', process.cwd());
  // but this runs inside the VM environment context
  // console.log('inside VM global.process.cwd:', vmProcessCwd);
  /************** These logs can be used to verify process.cwd() behavior **************/
});
