'use strict';

import { expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { HTTP } from 'meteor/http';
import faker from 'faker';
import { insertAutoincrements } from '/test/integration/server/helpers.app-tests';
import { } from '/imports/lib/fixtures/factories';

const createInvoice = function(modifier = {}) {
  this.distributor = Factory.create('user', { roles: ['distributor'],  'personalInformation.distlevel': 0 });
  this.buyer = Factory.create('user', {roles: ['buyer'], 'personalInformation.originatorId': this.distributor._id });
  const defaultModifier = {
    buyerId: this.buyer._id,
    state: 'receiptSent'
  };
  const invoiceTicket = Factory.create('invoiceTicket', Object.assign({}, defaultModifier, modifier));
  invoiceTicket.productVendingInvitation = {
    piiHash: modifier.productVendingInvitation ? modifier.productVendingInvitation.piiHash : faker.random.uuid(),
    email: faker.internet.email(),
    comment: 'Nice piiHash'
  };
  // Update productVendingInvitation with rawCollection to bypass schema unset
  InvoiceTickets.rawCollection().update(
      {"_id": invoiceTicket._id}, { $set: {
        productVendingInvitation: invoiceTicket.productVendingInvitation,
        updatedAt: new Date(),
      }});
  return invoiceTicket;
};

const getAuthorizationHeaders = () => {
  return { 'Authorization': '<SALES_APP_AUTH_API_TOKEN>'};
};

describe('Set invoice Ticket to vended', function() {

  // Set default timeout for this suite to 5 seconds to avoid fails on CI
  this.timeout(5000);
  beforeEach(function() {
    resetDatabase();
    insertAutoincrements();
  });

  it('set invoice Ticket to vended for a valid ticket', function(done) {
    console.log('set invoice Ticket to vended for a valid ticket');
    // Setup test data
    const invoiceTicket = createInvoice.bind(this)();

    const data = {
      piiHash: invoiceTicket.productVendingInvitation.piiHash
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setTicketVended`, { data, headers }, (httpError, response) => {
      try {
        console.log(response);
        expect(response.statusCode).to.equal(200);
        const ticket = InvoiceTickets.findOne();
        expect(ticket.hasVended).to.be.true;
        expect(moment(ticket.updatedAt).format()).to.equal(moment(ticket.changelog[0].changedAt).format());
        const ticketChangelog = ticket.changelog[0];
        expect(ticketChangelog.field).to.equal("hasVended");
        expect(ticketChangelog.value).to.be.true;
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 401 if invalid Authorization Token', function(done) {
    console.log('returns error 401 if invalid Authorization Token');

    HTTP.post(`${Meteor.absoluteUrl()}/api/setTicketVended`, { }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(401);
        expect(httpError.response.content).to.equal('Token Authorization error');
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 if piiHash param is not string', function(done) {
    console.log('returns error 400 if piiHash param is not string');

    const data = {
      piiHash: 1
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setTicketVended`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.equal('Invalid piiHash format');
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 if no piiHash param in body', function(done) {
    console.log('returns error 400 if no piiHash param in body');

    const data = {
      wrongHash: faker.random.uuid()
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setTicketVended`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.equal('Malformed request body, missing piiHash param');
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 if Invoice Ticket not found for piiHash', function(done) {
    console.log('returns error 400 if Invoice Ticket not found for piiHash');

    const data = {
      piiHash: faker.random.uuid()
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setTicketVended`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.include('Invoice Ticket not found for piiHash');
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 if there are more than one Invoice Ticket with that piiHash', function(done) {
    console.log('returns error 400 if there are more than one Invoice Ticket with that piiHash');

    const piiHash = faker.random.uuid();
    createInvoice.bind(this)({
      btcAddress: "mss5NFyX96ix4erFMamR1gK3SsvUSMWcjE",
      productVendingInvitation: { piiHash : piiHash }});
    createInvoice.bind(this)({
      btcAddress: "3E5sH77vAgw3gQq4zpuZ8XyXrjVbTcEYRG",
      productVendingInvitation: { piiHash : piiHash }});

    const data = {
      piiHash: piiHash
    };

    const invoices = InvoiceTickets.find({}).fetch();
    expect(invoices.length).to.equal(2);
    expect(invoices[0].productVendingInvitation.piiHash).to.equal(piiHash);
    expect(invoices[1].productVendingInvitation.piiHash).to.equal(piiHash);

    const headers = getAuthorizationHeaders();


    HTTP.post(`${Meteor.absoluteUrl()}/api/setTicketVended`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.equal('More than one Ticket found with piiHash: ' + piiHash);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 if Invoice Ticket is not ready to be set as vended', function(done) {
    console.log('returns error 400 if Invoice Ticket is not ready to be set as vended');
    const invoiceTicket = createInvoice.bind(this)({state: 'satoshisReceived'});

    const data = {
      piiHash: invoiceTicket.productVendingInvitation.piiHash
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setTicketVended`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.include('is not ready to be vended, state satoshisReceived');
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 if Invoice Ticket has already been set as vended', function(done) {
    console.log('returns error 400 if Invoice Ticket has already been set as vended');
    const invoiceTicket = createInvoice.bind(this)();
    InvoiceTickets.rawCollection().update(
        {"_id": invoiceTicket._id}, { $set: {
          hasVended: true,
          updatedAt: new Date(),
        } }
      );
    const data = {
      piiHash: invoiceTicket.productVendingInvitation.piiHash
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setTicketVended`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.equal(`Invoice Ticket ${ invoiceTicket._id } has already been set to vended.`);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });


  it('Try to set hasVended returns error', function(done) {
    console.log('Try to set piiHash returns error');
    const invoiceTicket = Factory.create('invoiceTicket', { hasVended: true});
    const storedTicket = InvoiceTickets.findOne(invoiceTicket._id);
    expect(storedTicket.hasVended).to.be.undefined;
    done();
  });

});
