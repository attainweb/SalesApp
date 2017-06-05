export const sleep = () => {
  let endTime = new Date().getTime();
  while (new Date().getTime() <= endTime);
};

export const getMeteorSettings = () => {
  return server.execute(() => { return Meteor.settings;} );
};

export const getServerEnv = () => {
  return server.execute(() => { return process.env; } );
};

export const getSHA256 = input => {
  return server.execute( anInput => { return SHA256(anInput); }, input );
};

export const parseValueFromString = function(string) {
  const containsPoint = string.toString().indexOf('.') !== -1;
  const isNumber = !isNaN(string);
  if (isNumber && containsPoint) {
    return parseFloat(string);
  } else if (isNumber) {
    return parseInt(string, 10);
  } else {
    return string;
  }
};

export const parsePropertiesTable = function(table) {
  const options = {};
  for (const option of table.rows()) {
    options[option[0]] = parseValueFromString(option[1]);
  }
  return options;
};

export const wrapValueAsFunction = function(value) {
  return function() { return value; };
};

export const stubDateNow = function(date) {
  const delta = new Date() - date;
  server.execute((delta) => {
    const dateService = require('/imports/lib/shared/date-service.js').default;
    dateService.now = () => {
      return new Date(new Date().getTime() - delta);
    };
  }, delta);
};

