/**
 * Simple class that abstracts the setup for a recurring method call with
 * configurable time interval and arguments. Useful for polling server-values
 * like total counters of collections.
 *
 * @example:
 * const poll = new RecurringMethodCall('my-count', 200);
 * poll.start(function(error, count) { total.set(count); });
 * poll.stop();
 */
class RecurringMethodCall {

  constructor(methodName, timeInterval) {
    this._methodName = methodName;
    this._timeInterval = timeInterval;
  }

  start() {
    let methodCall = this._generateMethodCall(Array.prototype.slice.call(arguments));
    if (this._intervalHandle !== undefined) clearInterval(this._intervalHandle);
    methodCall();
    this._intervalHandle = setInterval(methodCall, this._timeInterval);
  }

  stop() {
    clearInterval(this._intervalHandle);
  }

  _generateMethodCall(args) {
    args.unshift(this._methodName);
    return () => {
      Meteor.call.apply(Meteor, args);
    };
  }

}

this.RecurringMethodCall = RecurringMethodCall;
