#!/usr/bin/env node

/* eslint-disable */

require('@oclif/command')
  .run()
  .then(require('@oclif/command/flush'))
  .catch(require('@oclif/errors/handle'))
