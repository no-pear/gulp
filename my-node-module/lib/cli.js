#!/usr/bin/env node
'use strict';
const meow = require('meow');
const myNodeModule = require('./');

const cli = meow(`
Usage
  $ my-node-module [input]

Options
  --foo  Lorem ipsum. [Default: false]

Examples
  $ my-node-module
  unicorns
  $ my-node-module rainbows
  unicorns & rainbows
`);
