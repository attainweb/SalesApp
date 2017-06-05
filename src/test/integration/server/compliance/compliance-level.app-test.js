'use strict';

import {
  generateTelnetBitcoinAddressWithDataset1
} from '/imports/lib/fixtures/bitcoin-address-generator';

import { expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertAutoincrements } from '/test/integration/server/helpers.app-tests';
import { createInvoiceTicket } from '/imports/server/invoice-tickets/create-invoice-ticket';


const createTestDistributor = function() {
  return Factory.create('user', {
    roles: ['distributor'],
    "personalInformation.distlevel": 0,
  });
};

const createTestBuyer = function(distributorId, initialComplianceLevel, accountType) {
  return Factory.create('user', {
    roles: ['buyer'],
    emails: [{
      address: "test-buyer@atixlabs.com",
      verified: true
    }],
    'personalInformation.originatorId': distributorId,
    'personalInformation.complianceLevel': initialComplianceLevel, // (!)
    'personalInformation.applyingForComplianceLevel': undefined, // (!)
    'personalInformation.status': "APPROVED", // (!)
    'personalInformation.accountType': accountType, // (!)
  });
};

const fakeInitialPurchaseTotal = function(buyerId, initialPurchaseTotals) {
  Factory.create('invoiceTicket', {
    buyerId: buyerId,
    paymentOption: "BTC",
    createdAt: moment(),
    centsRequested: initialPurchaseTotals * 100, // (!) purchaseTotals: use usdRequested
    state: "invoiceSentBtc",
    btcAddress: generateTelnetBitcoinAddressWithDataset1(),
  });
};

// to do make more scenarios and refactor the code
describe('compliance', function() {
  console.log('compliance');
  // Set default timeout for this suite to 5 seconds to avoid fails on CI
  this.timeout(5000);

  beforeEach(function() {
    resetDatabase();
    insertAutoincrements();
  });

  const tests = [
    ["personal", 4,  800000,  5],
    ["personal", 9,  3300000, 10],
    ["personal", 13, 5300000, 14],
    ["company",  4,  500000,  5],
    ["company",  9,  3000000, 10],
    ["company",  12, 4500000, 13]
  ];

  tests.forEach(function(test) {

    const accountType = test[0];
    const initialComplianceLevel = test[1];
    const initialPurchaseTotals = test[2];
    const expectedComplianceLevel = test[3];

    it(`a buyer with compliance level ${initialComplianceLevel} 
    and puchase total ${initialPurchaseTotals}, 
    reorders 500000 usd, your level should increase to ${expectedComplianceLevel}`, function(done) {
      console.log(`a buyer with compliance level ${initialComplianceLevel} 
      and puchase total ${initialPurchaseTotals},
        reorders 500000 usd, your level should increase to ${expectedComplianceLevel}`);
      const distributor = createTestDistributor();
      const buyer = createTestBuyer(distributor._id, initialComplianceLevel, accountType);
      fakeInitialPurchaseTotal(buyer._id, initialPurchaseTotals);

      createInvoiceTicket({ buyerId: buyer._id, paymentOption: "BTC", usdRequested: 500000 }); // Test
      try {

        const tickets = InvoiceTickets.find({
          'buyerId': buyer._id
        });

        expect(tickets.count({})).to.equal(2);

        const buyerUpdated = Meteor.users.findOne({
          '_id': buyer._id
        });

        expect(buyerUpdated.personalInformation.applyingForComplianceLevel).to.equal(expectedComplianceLevel);

      } catch (expectError) {
        console.log('Errors found', expectError);
        done(expectError);
      }
      console.log('No errors found');
      done();
    }); // end test
  });

  const tests2 = [
    ["personal", 14, 5800000, 14],
    ["company", 13, 5000000, 13]
  ];

  tests2.forEach(function(test) {

    const accountType = test[0];
    const initialComplianceLevel = test[1];
    const initialPurchaseTotals = test[2];
    const expectedComplianceLevel = test[3];

    it(`a buyer with the max compliance level ${initialComplianceLevel} 
    (puchase total === ${initialPurchaseTotals}), 
    reorders 500000 usd, your level should be the same ${expectedComplianceLevel}`, function(done) {

      console.log(`a buyer with the max compliance level ${initialComplianceLevel} 
    (puchase total === ${initialPurchaseTotals}), 
    reorders 500000 usd, your level should be the same ${expectedComplianceLevel}`);
      const distributor = createTestDistributor();
      const buyer = createTestBuyer(distributor._id, initialComplianceLevel, accountType);
      fakeInitialPurchaseTotal(buyer._id, initialPurchaseTotals);

      createInvoiceTicket({ buyerId: buyer._id, paymentOption: "BTC", usdRequested: 500000 }); // Test
      try {

        const tickets = InvoiceTickets.find({
          'buyerId': buyer._id
        });

        expect(tickets.count({})).to.equal(2);

        const buyerUpdated = Meteor.users.findOne({
          '_id': buyer._id
        });

        expect(buyerUpdated.personalInformation.applyingForComplianceLevel).to.equal(undefined);
        expect(buyerUpdated.personalInformation.complianceLevel).to.equal(expectedComplianceLevel);

      } catch (expectError) {
        console.log('Errors found', expectError);
        done(expectError);
      }
      console.log('No errors found');
      done();
    }); // end test
  });
}); // end tests
