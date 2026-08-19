# official-ajv-draft-04-meta-schema

## What this file is

`official-ajv-draft-04-meta-schema.json` is the canonical JSON Schema draft-04 meta-schema — the schema that describes what a valid draft-04 JSON Schema looks like. It is sourced from the `ajv-draft-04` npm package (`node_modules/ajv-draft-04/dist/refs/json-schema-draft-04.json`), which itself mirrors the official specification document published by the JSON Schema organization.

## Why it exists here

`@adobe/reactor-validator` uses AJV v8 to validate Tags extension descriptors against the turbine platform schemas (`@adobe/reactor-turbine-schemas`). Those schemas declare `"$schema": "http://json-schema.org/draft-04/schema#"`, meaning they are draft-04 JSON Schemas.

AJV v8 ships meta-schemas for draft-06, draft-07, draft 2019-09, and draft 2020-12 — but not draft-04. Previously, the `ajv-draft-04` package was used as a dependency to supply both the draft-04 vocabulary and this meta-schema. That package declares `ajv@^8` as an optional peer dependency, which causes a runtime resolution failure for downstream consumers: npm nests `ajv@8` under this package's own `node_modules`, while `ajv-draft-04` gets hoisted to the consumer's top-level `node_modules` and resolves `require('ajv/dist/core')` against whatever AJV version the consumer has installed — which may be v6.

To eliminate that broken dependency chain, `ajv-draft-04` was removed and AJV v8 is now configured directly. This file provides the draft-04 meta-schema so AJV can validate that the turbine platform schemas are well-formed draft-04 schemas at compile time, preserving the same correctness guarantees as before.

## Source

- npm package: `ajv-draft-04` (any version)
- path within package: `dist/refs/json-schema-draft-04.json`
- upstream specification: http://json-schema.org/draft-04/schema
