import SalesPredictor from '/imports/lib/sales-predictor';
import { parsePropertiesTable, wrapValueAsFunction } from '../../_support/helpers';

module.exports = function() {

  this.Given(/^the following options:$/, function(table) {
    const options = parsePropertiesTable(table);
    if (options.amountInvoicedOrPaid !== undefined) {
      options.amountInvoicedOrPaid = wrapValueAsFunction(options.amountInvoicedOrPaid);
    }
    if (options.amountPaid !== undefined) {
      options.amountPaid = wrapValueAsFunction(options.amountPaid);
    }
    this.options = Object.assign(this.options || {}, options);
  });

  this.Given(/^a sales predictor is created with the given options$/, function() {
    this.sp = new SalesPredictor(this.options);
  });

  this.Then(/^the sales predictor should have the following properties:$/, function(table) {
    const properties = parsePropertiesTable(table);
    Object.keys(properties).forEach((key) => {
      const prop = this.sp[key];
      let value = typeof prop === 'function' ? prop() : prop;
      expect(value).to.equal(properties[key]);
    });
  });

  this.Then(/^the sales predictor should behave as follows:$/, function(table) {
    for (const sale of table.rows()) {
      expect(this.sp.allowSale(parseInt(sale[0], 10))).to.equal(sale[1] === 'true');
    }
  });

  this.Then(/^the sales goal should not have been reached$/, function() {
    expect(this.sp.salesGoalReached()).to.equal(false);
  });

  this.Then(/^the sales goal should have been reached$/, function() {
    expect(this.sp.salesGoalReached()).to.equal(true);
  });

};
