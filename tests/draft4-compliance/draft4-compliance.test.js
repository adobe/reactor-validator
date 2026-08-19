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

// Verifies that the AJV v8 instance created by createDraft4Ajv correctly handles JSON Schema
// draft-04 features. These tests exist specifically to guard against regressions if the
// vocabulary setup in createDraft4Ajv.js is changed — the turbine platform schemas do not
// exercise all draft-04 features, so integration tests alone are not sufficient.

'use strict';
var createDraft4Ajv = require('../../lib/createDraft4Ajv');

describe('draft-04 AJV compliance', () => {
  var ajv;

  beforeEach(() => {
    ajv = createDraft4Ajv();
  });

  // ─── Boolean exclusiveMinimum ─────────────────────────────────────────────────
  // draft-04 uses { minimum: N, exclusiveMinimum: true } to mean "strictly greater than N".
  // AJV v8's built-in limitNumber does not support this — it expects exclusiveMinimum to be
  // a number (draft-07 style). limitNumberDraft4 in createDraft4Ajv.js handles this correctly.

  describe('boolean exclusiveMinimum (draft-04 style)', () => {
    it('rejects the boundary value when exclusiveMinimum is true', () => {
      var schema = { type: 'number', minimum: 5, exclusiveMinimum: true };
      expect(ajv.validate(schema, 5)).toBe(false);
    });

    it('accepts a value above the boundary', () => {
      var schema = { type: 'number', minimum: 5, exclusiveMinimum: true };
      expect(ajv.validate(schema, 6)).toBe(true);
    });

    it('accepts the boundary value when exclusiveMinimum is absent', () => {
      var schema = { type: 'number', minimum: 5 };
      expect(ajv.validate(schema, 5)).toBe(true);
    });

    it('accepts the boundary value when exclusiveMinimum is false', () => {
      var schema = { type: 'number', minimum: 5, exclusiveMinimum: false };
      expect(ajv.validate(schema, 5)).toBe(true);
    });
  });

  // ─── Boolean exclusiveMaximum ─────────────────────────────────────────────────

  describe('boolean exclusiveMaximum (draft-04 style)', () => {
    it('rejects the boundary value when exclusiveMaximum is true', () => {
      var schema = { type: 'number', maximum: 5, exclusiveMaximum: true };
      expect(ajv.validate(schema, 5)).toBe(false);
    });

    it('accepts a value below the boundary', () => {
      var schema = { type: 'number', maximum: 5, exclusiveMaximum: true };
      expect(ajv.validate(schema, 4)).toBe(true);
    });

    it('accepts the boundary value when exclusiveMaximum is absent', () => {
      var schema = { type: 'number', maximum: 5 };
      expect(ajv.validate(schema, 5)).toBe(true);
    });

    it('accepts the boundary value when exclusiveMaximum is false', () => {
      var schema = { type: 'number', maximum: 5, exclusiveMaximum: false };
      expect(ajv.validate(schema, 5)).toBe(true);
    });
  });

  // ─── Draft-04 meta-schema registration ───────────────────────────────────────
  // The draft-04 meta-schema is registered so AJV validates that the turbine platform schemas
  // are well-formed draft-04 at compile time. validateSchema() uses the registered meta-schema
  // to check schema structure — it returns true for valid draft-04 and false for invalid.

  describe('draft-04 meta-schema registration', () => {
    it('recognizes { minimum, exclusiveMinimum: true } as a valid draft-04 schema', () => {
      var schema = { type: 'number', minimum: 0, exclusiveMinimum: true };
      expect(ajv.validateSchema(schema)).toBe(true);
    });

    it('rejects draft-07 style { exclusiveMinimum: 0 } as invalid draft-04', () => {
      // In draft-04 exclusiveMinimum must be a boolean, not a number.
      var schema = { exclusiveMinimum: 0 };
      expect(ajv.validateSchema(schema)).toBe(false);
    });

    it('rejects exclusiveMinimum without a sibling minimum', () => {
      // The draft-04 meta-schema declares a dependency: exclusiveMinimum requires minimum.
      var schema = { type: 'number', exclusiveMinimum: true };
      expect(ajv.validateSchema(schema)).toBe(false);
    });

    it('rejects exclusiveMaximum without a sibling maximum', () => {
      var schema = { type: 'number', exclusiveMaximum: true };
      expect(ajv.validateSchema(schema)).toBe(false);
    });
  });

  // ─── $ref with definitions ────────────────────────────────────────────────────
  // draft-04 uses "definitions" (not "$defs") for reusable sub-schemas.
  // This is the primary pattern used by the turbine platform schemas.

  describe('$ref with definitions', () => {
    it('resolves $ref against definitions in the same schema', () => {
      var schema = {
        definitions: {
          positiveNumber: { type: 'number', minimum: 1 }
        },
        type: 'object',
        properties: {
          count: { '$ref': '#/definitions/positiveNumber' }
        },
        required: ['count']
      };
      expect(ajv.validate(schema, { count: 5 })).toBe(true);
      expect(ajv.validate(schema, { count: 0 })).toBe(false);
      expect(ajv.validate(schema, {})).toBe(false);
    });

    it('resolves nested $ref chains through definitions', () => {
      var schema = {
        definitions: {
          nonEmptyString: { type: 'string', minLength: 1 },
          label: { '$ref': '#/definitions/nonEmptyString' }
        },
        type: 'object',
        properties: {
          name: { '$ref': '#/definitions/label' }
        },
        required: ['name']
      };
      expect(ajv.validate(schema, { name: 'hello' })).toBe(true);
      expect(ajv.validate(schema, { name: '' })).toBe(false);
    });
  });

  // ─── id keyword ───────────────────────────────────────────────────────────────
  // draft-04 uses "id" (not "$id") for schema identification. schemaId: 'id' in the AJV
  // options tells AJV to use "id" as the canonical schema identifier.

  describe('id keyword', () => {
    it('accepts a schema that uses id for identification', () => {
      var schema = {
        id: 'http://example.com/test-schema#',
        type: 'object',
        properties: {
          name: { type: 'string' }
        },
        required: ['name']
      };
      expect(ajv.validate(schema, { name: 'hello' })).toBe(true);
      expect(ajv.validate(schema, { name: 123 })).toBe(false);
      expect(ajv.validate(schema, {})).toBe(false);
    });
  });

  // ─── additionalItems ──────────────────────────────────────────────────────────
  // Controls whether array items beyond those defined in "items" (as a tuple) are allowed.

  describe('additionalItems', () => {
    it('rejects extra array items when additionalItems is false', () => {
      var schema = {
        type: 'array',
        items: [{ type: 'string' }, { type: 'number' }],
        additionalItems: false
      };
      expect(ajv.validate(schema, ['hello', 42])).toBe(true);
      expect(ajv.validate(schema, ['hello', 42, 'extra'])).toBe(false);
    });

    it('allows extra items when additionalItems is a schema and they match', () => {
      var schema = {
        type: 'array',
        items: [{ type: 'string' }],
        additionalItems: { type: 'number' }
      };
      expect(ajv.validate(schema, ['hello', 1, 2, 3])).toBe(true);
      expect(ajv.validate(schema, ['hello', 'not-a-number'])).toBe(false);
    });
  });

  // ─── dependencies ─────────────────────────────────────────────────────────────
  // draft-04 "dependencies" declares that the presence of one property requires
  // either another property (property dependency) or a sub-schema to validate (schema dependency).

  describe('dependencies', () => {
    it('requires a dependent property when its dependency is present', () => {
      var schema = {
        type: 'object',
        dependencies: {
          creditCard: ['billingAddress']
        }
      };
      expect(ajv.validate(schema, { creditCard: '1234', billingAddress: '123 Main St' })).toBe(true);
      expect(ajv.validate(schema, { creditCard: '1234' })).toBe(false);
      expect(ajv.validate(schema, { billingAddress: '123 Main St' })).toBe(true);
      expect(ajv.validate(schema, {})).toBe(true);
    });

    it('validates a schema dependency when the trigger property is present', () => {
      var schema = {
        type: 'object',
        dependencies: {
          name: {
            properties: { name: { type: 'string', minLength: 1 } },
            required: ['name']
          }
        }
      };
      expect(ajv.validate(schema, { name: 'Alice' })).toBe(true);
      expect(ajv.validate(schema, { name: '' })).toBe(false);
      expect(ajv.validate(schema, {})).toBe(true);
    });
  });
});
