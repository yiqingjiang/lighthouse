#!/usr/bin/env node
/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* eslint-disable no-console */

/** @typedef {import('./constants.js').Golden} Golden */

const fs = require('fs');
const path = require('path');
const execFileSync = require('child_process').execFileSync;
const constants = require('./constants.js');

const INPUT_PATH = process.argv[2] || constants.SITE_INDEX_WITH_GOLDEN_PATH;
const SITE_INDEX_PATH = path.resolve(process.cwd(), INPUT_PATH);
const SITE_INDEX_DIR = path.dirname(SITE_INDEX_PATH);
const RUN_ONCE_PATH = path.join(__dirname, 'run-once.js');

if (!fs.existsSync(SITE_INDEX_PATH)) throw new Error('Usage $0 <expectations file>');

/** @type {Golden[]} */
const golden = require(SITE_INDEX_PATH);

for (const result of golden) {
  const trace = path.join(SITE_INDEX_DIR, result.unthrottled.trace);
  if (!result.unthrottled.devtoolsLog) throw new Error('missing devtools log'); // This won't happen.
  const log = path.join(SITE_INDEX_DIR, result.unthrottled.devtoolsLog);

  console.log('Running', result.url, '...');
  const rawOutput = execFileSync(RUN_ONCE_PATH, [trace, log])
    .toString()
    .trim();
  if (!rawOutput) console.log('ERROR EMPTY OUTPUT!');
  const lantern = JSON.parse(rawOutput);

  Object.assign(result, {lantern});
}

// eslint-disable-next-line max-len
fs.writeFileSync(constants.SITE_INDEX_WITH_GOLDEN_WITH_COMPUTED_PATH, JSON.stringify(golden, null, 2));
