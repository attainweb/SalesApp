import { expect } from 'meteor/practicalmeteor:chai';
import SalesPredictor from '/imports/lib/sales-predictor.js';

describe('SalesPredictor', function() {

  describe('Scenarios totalAmountAvailable:1000 oct:0.2', function() {
    beforeEach(function() {
      this.options = {
        totalAmountAvailable: 1000,
        overCapacityTolerance: 0.2,
        amountInvoicedOrPaid: () => { return 0; },
        amountPaid: () => { return 0; },
      };
    });

    //  taa oct  tot  ap  aip req tot  allowSale  salesGoalReached
    // ==== === ====  == ==== == ====  =====      =====
    // 1000 20% 1200   0  200 50  250   true      false
    it('aip:200 ap:0', function() {
      this.options.amountInvoicedOrPaid = () => { return 200; };
      const sp = new SalesPredictor(this.options);
      expect( sp.salesGoalReached() ).to.equal(false);
      expect( sp.allowSale(50) ).to.equal(true);
    });

    //  taa oct  tot  ap  aip req tot  allowSale  salesGoalReached
    // ==== === ====  == ==== == ====  =====      =====
    // 1000 20% 1200   0  950 50 1000   true      false
    it('aip:950 ap:0', function() {
      this.options.amountInvoicedOrPaid = () => { return 950; };
      const sp = new SalesPredictor(this.options);
      expect( sp.salesGoalReached() ).to.equal(false);
      expect( sp.allowSale(50) ).to.equal(true);
    });

    //  taa oct  tot  ap  aip req tot  allowSale  salesGoalReached
    // ==== === ====  == ==== == ====  =====      =====
    // 1000 20% 1200   0 1000 50 1050   true      false
    it('aip:1000 ap:0', function() {
      this.options.amountInvoicedOrPaid = () => { return 1000; };
      const sp = new SalesPredictor(this.options);
      expect( sp.salesGoalReached() ).to.equal(false);
      expect( sp.allowSale(50) ).to.equal(true);
    });

    //  taa oct  tot  ap  aip req tot  allowSale  salesGoalReached
    // ==== === ====  == ==== == ====  =====      =====
    // 1000 20% 1200   0 1050 50 1100  false       true
    it('aip:1050 ap:0', function() {
      this.options.amountInvoicedOrPaid = () => { return 1050; };
      const sp = new SalesPredictor(this.options);
      expect( sp.salesGoalReached() ).to.equal(false);
      expect( sp.allowSale(50) ).to.equal(true);
      expect( sp.allowSale(60) ).to.equal(true);
      expect( sp.allowSale(61) ).to.equal(false);
    });

    //  taa oct  tot  ap  aip req tot  allowSale  salesGoalReached
    // ==== === ====  == ==== == ====  =====      =====
    // 1000 20% 1200   0 1200 50 1250  false       true
    it('aip:1199 ap:0', function() {
      this.options.amountInvoicedOrPaid = () => { return 1199; };
      const sp = new SalesPredictor(this.options);
      expect( sp.salesGoalReached() ).to.equal(false);
      expect( sp.allowSale(1) ).to.equal(true);
      expect( sp.allowSale(50) ).to.equal(false);
    });
    it('aip:1200 ap:0', function() {
      this.options.amountInvoicedOrPaid = () => { return 1200; };
      const sp = new SalesPredictor(this.options);
      expect( sp.salesGoalReached() ).to.equal(false);
      expect( sp.allowSale(1) ).to.equal(false);
      expect( sp.allowSale(50) ).to.equal(false);
    });
    it('aip:1201 ap:0', function() {
      this.options.amountInvoicedOrPaid = () => { return 1201; };
      const sp = new SalesPredictor(this.options);
      expect( sp.salesGoalReached() ).to.equal(false);
      expect( sp.allowSale(50) ).to.equal(false);
    });
  });


});
