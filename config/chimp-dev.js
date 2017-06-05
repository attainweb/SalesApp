const path = require('path');
// Defaults: https://github.com/xolvio/chimp/blob/master/src/bin/default.js
module.exports = {
  path: path.resolve('src/test/end-to-end/tests'),
  serverPort: 3100,
  serverHost: 'localhost',
  chai: true,
  ddp: 'http://localhost:3100',
  webdriverio: {
    waitforTimeout: 10000
  },
  mochaTimeout: 10000,
  seleniumStandaloneOptions: {
    drivers: {
      chrome: {
        version: "2.24"
      }
    }
  }
};
