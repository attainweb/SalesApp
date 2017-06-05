#!/usr/bin/env node
"use strict";

const path = require('path');
const extend = require('util')._extend;
const baseDir = path.resolve(__dirname, '../..');
const srcDir = path.resolve(baseDir, 'src');
const source = require(`${srcDir}/node_modules/shell-source`);
const chimpPath = `${srcDir}/node_modules/.bin/chimp`;
const processes = require(`${baseDir}/bin/_helpers/processes.js`);
const isCi = process.argv[2] === '--ci';

const startTestApp = function(onStarted, environment, passOnParams) {
  // Start the chimp test app on port 3100 that reuses the dev mongoDb of
  // Meteor but registers a separate DB called `chimp_db` for the test app
  console.log("Starting test app on port 3100 …");
  console.log("Sourcing ./bin/env/testing.sh as environment …");
  source(baseDir + '/bin/env/testing.sh', function(testingSourceError) {
    if (testingSourceError) return console.error(testingSourceError);
    return processes.start({
      name: 'Test App',
      command: 'meteor --settings ../config/testing.json --port 3100 --no-release-check',
      waitForMessage: 'App running at: http://localhost:3100',
      options: {
        cwd: srcDir,
        env: extend(process.env, environment)
      }
    }, function() {
      console.log("Test app is running …");
      onStarted.apply(null, passOnParams || []);
    });
  });
};

const startChimpDev = function(watchMode) {
  processes.start({
    name: 'Chimp Watch',
    command: `${chimpPath} ${baseDir}/config/chimp-dev.js ${watchMode || ''}`,
    options: { cwd: baseDir }
  });
};

const startChimpCircleCi = function() {
  let command = `${chimpPath} ${baseDir}/config/chimp-ci.js`;
  if (process.env.CIRCLECI) {
    command += ' --jsonOutput=$CIRCLE_TEST_REPORTS/chrome.cucumber --screenshotsPath=$CIRCLE_ARTIFACTS/chrome --saveScreenshots';
  }
  processes.start({
    name: 'Chimp CircleCi',
    command: command,
    options: { cwd: baseDir }
  });
};

if (isCi) {
  // CI mode -> run once
  if (process.env.CIRCLECI) {
    startTestApp(startChimpCircleCi);
  } else {
    // Use a different db for local ci testing to avoid nuking of the dev db
    startTestApp(startChimpDev, {
      TEST_MODE: 'acceptance',
      MONGO_URL: 'mongodb://localhost:3001/chimp_db'
    });
  }
} else {
  // DEV mode -> watch
  startTestApp(startChimpDev, {
    TEST_MODE: 'acceptance',
    MONGO_URL: 'mongodb://localhost:3001/chimp_db'
  }, ['--watch']);
}
