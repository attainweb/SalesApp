if (typeof Meteor !== 'undefined' && Meteor.isServer) {
  Logger = require('/imports/server/lib/logger').default;
}

export default class SalesPredictor {
  /*
    numbers:
      totalAmountAvailable:    Total amount available in this tranche
      totalAmountAvailableCap: Total amount available + over cap
      overCapacityTolerance:    Overcapacity tolerance

    functions:
      amountInvoicedOrPaid:  Amount of invoiced or received payment in this tranche
      amountPaid:   Amount of received payment in this tranche
  */
  constructor(options) {
    this.totalAmountAvailable = parseInt(options.totalAmountAvailable, 10) || 0;
    this.overCapacityTolerance = parseFloat(options.overCapacityTolerance) || 0;
    this.amountInvoicedOrPaid = options.amountInvoicedOrPaid || function() { return 0; };
    this.amountPaid  = options.amountPaid  || function() { return 0; };
    this.overCapacityToleranceValue = this.totalAmountAvailable * this.overCapacityTolerance;
    this.totalAmountAvailableCap = this.totalAmountAvailable + this.overCapacityToleranceValue;
  }

  salesGoalReached() {
    return this.amountPaid() >= this.totalAmountAvailable;
  }

  allowSale(amount) {
    // amount + AIP < TAA
    const curAip = this.amountInvoicedOrPaid();
    const salesPayRate = 0.3;
    const reducedOctValue = this.overCapacityToleranceValue * salesPayRate;
    const underTotalLimit = amount + curAip <= this.totalAmountAvailable;
    const underCapTotalLimit = amount + curAip <= this.totalAmountAvailableCap;

    if (typeof Meteor !== 'undefined' && Meteor.isServer) {
      Logger.info(" SalesPredictor",
        this.salesGoalReached(), '|', underTotalLimit,
        this.totalAmountAvailable,
        this.overCapacityTolerance, '|', this.overCapacityToleranceValue,
        this.totalAmountAvailableCap,
        curAip,
        reducedOctValue,
        underCapTotalLimit);
    }

    if (this.salesGoalReached()) {
      return false;
    }

    if (underTotalLimit) {
      return true;
    }

    /*
    we are already approaching the end of the sale so reduce the size of
    the allowed amount to 33% of the overcapacity
    */
    return (underCapTotalLimit && amount <= reducedOctValue);
  }
}
