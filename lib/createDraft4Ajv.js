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

// Factory that creates an AJV v8 instance configured for JSON Schema draft-04.
//
// AJV v8 speaks draft-07 natively and does not ship a draft-04 meta-schema. This module
// replicates what the ajv-draft-04 package provided, using only ajv's own internal modules,
// so downstream consumers are not exposed to ajv-draft-04's broken optional peer-dependency
// chain (see: https://github.com/adobe/reactor-validator/issues/XX).

'use strict';
var _ajvCore = require('ajv/dist/core');
var AjvCore = _ajvCore.default;
var _ = _ajvCore._;
var str = _ajvCore.str;
var ops = require('ajv/dist/compile/codegen').operators;
var addAJVFormats = require('ajv-formats');
var draft4MetaSchema = require('../OpenJSFoundation/draft04/official-ajv-draft-04-meta-schema/official-ajv-draft-04-meta-schema.json');

var DRAFT4_META_SCHEMA_ID = 'http://json-schema.org/draft-04/schema';

// JSON Schema draft-04 and draft-07 express "exclusive" range limits differently:
//
//   draft-04: two keywords — a numeric "minimum" plus a boolean flag "exclusiveMinimum: true"
//             e.g. { "minimum": 0, "exclusiveMinimum": true } means value must be > 0
//
//   draft-07: one keyword — "exclusiveMinimum" is itself the numeric limit
//             e.g. { "exclusiveMinimum": 0 } means value must be > 0
//
// AJV v8 speaks draft-07 natively, so it expects exclusiveMinimum/exclusiveMaximum to always
// be numbers. The draft-04 meta-schema we register (so AJV can validate that the turbine platform
// schemas are well-formed draft-04) uses the boolean flag style internally. Without custom
// handlers, AJV v8 throws "exclusiveMinimum value must be [number]" when it tries to compile
// that meta-schema.
//
// limitNumberDraft4 replaces AJV v8's built-in limitNumber. It handles "minimum"/"maximum" as
// numeric keywords but peeks at the parent schema for a boolean exclusiveMinimum/exclusiveMaximum
// flag, switching between strict (>) and non-strict (>=) comparisons accordingly.
//
// limitNumberExclusiveDraft4 registers "exclusiveMinimum"/"exclusiveMaximum" as valid boolean
// keywords so AJV does not reject them. It generates no data-validation code — the actual
// comparison logic lives in limitNumberDraft4 above.
var LIMIT_KWDS = {
  maximum: {
    exclusive: 'exclusiveMaximum',
    ops: [
      { okStr: '<=', ok: ops.LTE, fail: ops.GT },
      { okStr: '<',  ok: ops.LT,  fail: ops.GTE },
    ],
  },
  minimum: {
    exclusive: 'exclusiveMinimum',
    ops: [
      { okStr: '>=', ok: ops.GTE, fail: ops.LT },
      { okStr: '>',  ok: ops.GT,  fail: ops.LTE },
    ],
  },
};

function kwdOp(cxt) {
  var kwd = LIMIT_KWDS[cxt.keyword];
  var opsIdx = (cxt.parentSchema && cxt.parentSchema[kwd.exclusive]) ? 1 : 0;
  return kwd.ops[opsIdx];
}

var limitNumberDraft4 = {
  keyword: Object.keys(LIMIT_KWDS),
  type: 'number',
  schemaType: 'number',
  $data: true,
  error: {
    message: function(cxt) { return str`must be ${kwdOp(cxt).okStr} ${cxt.schemaCode}`; },
    params:  function(cxt) { return _`{comparison: ${kwdOp(cxt).okStr}, limit: ${cxt.schemaCode}}`; },
  },
  code: function(cxt) {
    cxt.fail$data(_`${cxt.data} ${kwdOp(cxt).fail} ${cxt.schemaCode} || isNaN(${cxt.data})`);
  },
};

var limitNumberExclusiveDraft4 = {
  keyword: ['exclusiveMaximum', 'exclusiveMinimum'],
  type: 'number',
  schemaType: 'boolean',
  code: function(cxt) {
    var paired = { exclusiveMaximum: 'maximum', exclusiveMinimum: 'minimum' };
    if (cxt.parentSchema[paired[cxt.keyword]] === undefined) {
      throw new Error(cxt.keyword + ' can only be used with ' + paired[cxt.keyword]);
    }
  },
};

var draft4CoreVocab = [
  '$schema', 'id', '$defs', '$comment', 'definitions',
  require('ajv/dist/vocabularies/core/ref').default,
];

var draft4ValidationVocab = [
  limitNumberDraft4,
  limitNumberExclusiveDraft4,
  require('ajv/dist/vocabularies/validation/multipleOf').default,
  require('ajv/dist/vocabularies/validation/limitLength').default,
  require('ajv/dist/vocabularies/validation/pattern').default,
  require('ajv/dist/vocabularies/validation/limitProperties').default,
  require('ajv/dist/vocabularies/validation/required').default,
  require('ajv/dist/vocabularies/validation/limitItems').default,
  require('ajv/dist/vocabularies/validation/uniqueItems').default,
  { keyword: 'type', schemaType: ['string', 'array'] },
  { keyword: 'nullable', schemaType: 'boolean' },
  require('ajv/dist/vocabularies/validation/const').default,
  require('ajv/dist/vocabularies/validation/enum').default,
];

module.exports = function createDraft4Ajv() {
  var ajv = new AjvCore({ schemaId: 'id', strict: false, defaultMeta: DRAFT4_META_SCHEMA_ID });
  ajv.addVocabulary(draft4CoreVocab);
  ajv.addVocabulary(draft4ValidationVocab);
  ajv.addVocabulary(require('ajv/dist/vocabularies/applicator').default());
  ajv.addVocabulary(require('ajv/dist/vocabularies/format').default);
  ajv.addVocabulary(['title', 'description', 'default']);
  ajv.addMetaSchema(draft4MetaSchema, DRAFT4_META_SCHEMA_ID, false);
  ajv.refs['http://json-schema.org/schema'] = DRAFT4_META_SCHEMA_ID;
  addAJVFormats(ajv);
  return ajv;
};
