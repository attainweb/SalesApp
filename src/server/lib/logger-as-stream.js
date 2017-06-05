'use strict';

import { Writable } from 'stream';
import util from 'util';

const LoggerStream = function(logger) {
  this.logger = logger;
  Writable.call(this, { decodeStrings: false, objectMode: true });
};

util.inherits(LoggerStream, Writable);

LoggerStream.prototype._write = function(data, encoding, callback) {
  //
  // Remark we are going to do fire and forget style cause otherwise it will
  // cause backpressue and fuck that shit. Also allow tags to be on the data
  // object for easy addition
  //
  if (typeof data !== 'undefined' && data) {
    this.logger.info(data);
  }

  callback();
};

const wrappLoggerAsStream = function wrapLogglyAsStream(logger) {
  return new LoggerStream(logger);
};

export default wrappLoggerAsStream;
