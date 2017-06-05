'use strict';

import { expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { HTTP } from 'meteor/http';
import { generateTelnetBitcoinAddressWithDataset1 } from '/imports/lib/fixtures/bitcoin-address-generator';
import { insertAutoincrements } from '/test/integration/server/helpers.app-tests';

describe('commissionsMovedToWallet', function() {

  // Set default timeout for this suite to 10 seconds to avoid fails on CI
  this.timeout(10000);
  console.log('commissionsMovedToWallet');
  beforeEach(function() {
    resetDatabase();
    insertAutoincrements();
  });

  it('sets commissionsMoved to true for a valid ticket', function(done) {
    // Setup test data
    let distributor = Factory.create('user', { roles: ['distributor'],  'personalInformation.distlevel': 0 });
    let buyer = Factory.create('user', {roles: ['buyer'], 'personalInformation.originatorId': distributor._id });

    let invoiceTicket = Factory.create('invoiceTicket', {
      buyerId: buyer._id,
      commissionsMoved: false,
      btcAddress: '3E5sH77vAgw3gQq4zpuZ8XyXrjVbTcEYRG',
      state: 'satoshisReceived',
      fundsReceived: true
    });

    let commissions = API.calculateCommissions(invoiceTicket._id, invoiceTicket.satoshisReceived);

    InvoiceTickets.update({"_id": invoiceTicket._id}, {$set: {commissions: commissions}});

    const data = {
      satoshisAmount: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      date: new Date()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/commissionsMovedToWallet`, { data }, (httpError, response) => {
      console.log("response------------------ ", response);
      try {
        const ticket = InvoiceTickets.findOne();
        expect(ticket.commissionsMoved).to.equal(true);
        expect(response.statusCode).to.equal(200);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 400 for a malformed request body', function(done) {

    HTTP.post(`${Meteor.absoluteUrl()}/api/commissionsMovedToWallet`, {}, (httpError, response) => {
      console.log("response------------------ ", response);
      try {
        expect(response.content).to.equal('Malformed request body');
        expect(response.statusCode).to.equal(400);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 400 for a ticket not found', function(done) {

    const data = {
      satoshisAmount: 1000,
      invoiceAddress: generateTelnetBitcoinAddressWithDataset1(),
      date: new Date()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/commissionsMovedToWallet`, { data }, (httpError, response) => {
      console.log("response------------------ ", response);
      try {
        expect(response.content).to.equal(`Ticket not found for address: ${data.invoiceAddress}`);
        expect(response.statusCode).to.equal(400);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 587 for a ticket whose commissions already moved', function(done) {
    // Setup test data
    let distributor = Factory.create('user', { roles: ['distributor'],  'personalInformation.distlevel': 0 });
    let buyer = Factory.create('user', {roles: ['buyer'], 'personalInformation.originatorId': distributor._id });

    let invoiceTicket = Factory.create('invoiceTicket', {
      buyerId: buyer._id,
      commissionsMoved: true,
      btcAddress: '3E5sH77vAgw3gQq4zpuZ8XyXrjVbTcEYRG',
      state: 'ticketFinalized'
    });

    const data = {
      satoshisAmount: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      date: new Date()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/commissionsMovedToWallet`, { data }, (httpError, response) => {
      console.log("response------------------ ", response);
      try {
        expect(response.content).to.equal(`Ticket at address: ${invoiceTicket.btcAddress} already had commissions moved to wallet.`);
        expect(response.statusCode).to.equal(587);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 400 for a ticket whose commissions are not found', function(done) {
    // Setup test data
    let distributor = Factory.create('user', { roles: ['distributor'],  'personalInformation.distlevel': 0 });
    let buyer = Factory.create('user', {roles: ['buyer'], 'personalInformation.originatorId': distributor._id });

    let invoiceTicket = Factory.create('invoiceTicket', {
      buyerId: buyer._id,
      commissionsMoved: false,
      btcAddress: '3E5sH77vAgw3gQq4zpuZ8XyXrjVbTcEYRG',
      state: 'ticketFinalized'
    });

    const data = {
      satoshisAmount: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      date: new Date()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/commissionsMovedToWallet`, { data }, (httpError, response) => {
      console.log("response------------------ ", response);
      try {
        expect(response.content).to.equal(`Commissions not found for ticket at address: ${invoiceTicket.btcAddress}`);
        expect(response.statusCode).to.equal(400);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });
});
