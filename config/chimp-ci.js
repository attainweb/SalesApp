const path = require('path');
const baseDir = path.resolve(__dirname, '..');
// Defaults: https://github.com/xolvio/chimp/blob/master/src/bin/default.js
module.exports = {
  path: `${baseDir}/src/test/end-to-end/tests`,
  serverPort: 3100,
  serverHost: 'localhost',
  chai: true,
  ddp: 'http://localhost:3100',
  webdriverio: {
    // TODO: decrease this once we solved the problem of Meteor downloading
    // next release during testing (which causes timeouts on CircleCi)
    waitforTimeout: 180000
  },
  mochaTimeout: 180000,
  seleniumStandaloneOptions: {
    drivers: {
      chrome: {
        version: "2.24"
      }
    }
  }
};
