'use strict';

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { _ } from 'meteor/underscore';
import { insertAutoincrements, expectApiError, expectApiResult } from '/test/integration/server/helpers.app-tests';
import { generateTelnetBitcoinAddressWithDataset1, generateTelnetBitcoinAddressWithDataset2 } from '/imports/lib/fixtures/bitcoin-address-generator';

describe('HTTP endpoint /api/holdingWalletReceivedBtc', function() {

  // Set default timeout for this suite to 5 seconds to avoid fails on CI
  this.timeout(5000);
  console.log('HTTP endpoint /api/holdingWalletReceivedBtc');

  // Helpers
  const apiUrl = `${Meteor.absoluteUrl()}/api/holdingWalletReceivedBtc`;
  const constructRequest = function(override = {}) {
    return _.extend({
      holdingWalletAddress: generateTelnetBitcoinAddressWithDataset1(),
      satoshisReceived: 1000,
      transactionId: generateTelnetBitcoinAddressWithDataset2()
    }, override);
  };

  // Setup
  beforeEach(function() {
    resetDatabase();
    insertAutoincrements();
  });

  describe("invalid requests", function() {
    console.log('invalid requests');
    it('returns 400 for empty requests', function(done) {
      console.log('returns 400 for empty requests');
      expectApiError(apiUrl, {}, 'Malformed request body', 400, done);
    });

    it('returns 400 for float satoshis amounts', function(done) {
      console.log('returns 400 for float satoshis amounts');

      const request = constructRequest({ satoshisReceived: 1.1 });
      expectApiError(apiUrl, request, 'Malformed request body', 400, done);
    });

    it('returns 400 for higher than integer limit satoshis amounts', function(done) {
      console.log('returns 400 for higher than integer limit satoshis amounts');

      const request = constructRequest({ satoshisReceived: 9007199254740993 });
      expectApiError(apiUrl, request, 'Malformed request body', 400, done);
    });

    it('returns 400 for an invalid wallet address', function(done) {
      console.log('returns 400 for an invalid wallet address');

      const request = constructRequest({ holdingWalletAddress: 'invalidAddress' });
      const message = 'Invalid bitcoin address, holdingWalletAddress: invalidAddress';
      expectApiError(apiUrl, request, message, 400, done);
    });

    it('returns 400 for zero satoshi amounts', function(done) {
      console.log('returns 400 for zero satoshi amounts');

      const request = constructRequest({ satoshisReceived: 0 });
      const message = 'satoshisReceived must be a positive value: 0';
      expectApiError(apiUrl, request, message, 400, done);
    });

    it('returns 400 for negative satoshi amounts', function(done) {
      console.log('returns 400 for negative satoshi amounts');

      const request = constructRequest({ satoshisReceived: -1 });
      const message = 'satoshisReceived must be a positive value: -1';
      expectApiError(apiUrl, request, message, 400, done);
    });

    it("returns 400 if there is no bundle for the given wallet address", function(done) {
      console.log('returns 400 if there is no bundle for the given wallet address');

      const request = constructRequest();
      const message = 'There is no bundle for this holding wallet address: ' + request.holdingWalletAddress;
      expectApiError(apiUrl, request, message, 400, done);
    });

    it("returns 590 if satoshis received does not match batch fullfillment amount", function(done) {
      console.log('returns 590 if satoshis received does not match batch fullfillment amount');

      const paymentExport = Factory.create('paymentExport', {
        batchFulfillmentAmount: 1000
      });
      const request = constructRequest({
        holdingWalletAddress: paymentExport.holdingWalletAddress,
        satoshisReceived: 999,
      });
      const message = "PaymentExport " + paymentExport._id + " batchFulfillmentAmount " + paymentExport.batchFulfillmentAmount + " does not match satoshisReceived " + request.satoshisReceived;
      expectApiError(apiUrl, request, message, 590, done);
    });
    console.log('No errors found');
  });

  describe("successful requests", function() {

    it("returns 200 when the request was successful", function(done) {
      console.log('returns 200 when the request was successful');
      let invoiceTicket = Factory.create('invoiceTicket', {
        state: 'ticketBundled',
        satoshisExpected: 1000,
        btcAddress: generateTelnetBitcoinAddressWithDataset1()
      });
      const paymentExport = Factory.create('paymentExport', {
        invoiceTicketIds: [invoiceTicket._id],
        batchFulfillmentAmount: invoiceTicket.satoshisExpected
      });
      const request = constructRequest({
        holdingWalletAddress: paymentExport.holdingWalletAddress,
        satoshisReceived: paymentExport.batchFulfillmentAmount,
      });
      const expectedMessage = JSON.stringify({
        payout: [{
          invoiceAddress: invoiceTicket.btcAddress,
          amount: paymentExport.batchFulfillmentAmount
        }]
      });
      expectApiResult(apiUrl, request, expectedMessage, done);
    });
    console.log('No errors found');

  });

});
