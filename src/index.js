// allow use of es modules (import/export syntax)
require = require('esm')(module);
require('../src/cli').cli(process.argv);
