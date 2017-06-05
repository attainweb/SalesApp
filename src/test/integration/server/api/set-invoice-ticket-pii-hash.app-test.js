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
    state: 'receiptSent',
    satoshisExpected: 1000,
    btcAddress: '3E5sH77vAgw3gQq4zpuZ8XyXrjVbTcEYRG',
    productPasscode: undefined,
    productPasscodeHash: undefined,
  };
  const invoiceTicket = Factory.create('invoiceTicket', Object.assign({}, defaultModifier, modifier));
  // Update with rawCollection to bypass schema unset
  if (modifier.hasVended) {
    InvoiceTickets.rawCollection().update(
      {"_id": invoiceTicket._id}, { $set: {
        hasVended: true,
        updatedAt: new Date(),
      }});
  }
  return invoiceTicket;
};

const getAuthorizationHeaders = () => {
  return { 'Authorization': '<SALES_APP_AUTH_API_TOKEN>'};
};

describe('Set invoice Ticket piiHash data', function() {

  // Set default timeout for this suite to 5 seconds to avoid fails on CI
  this.timeout(5000);
  console.log('setInvoiceTicketPiiHash');
  beforeEach(function() {
    resetDatabase();
    insertAutoincrements();
  });

  it('set invoice Ticket piiHash for a valid ticket with comment', function(done) {
    console.log('set invoice Ticket piiHash for a valid ticket with comment');
    // Setup test data
    const invoiceTicket = createInvoice.bind(this)( { productPasscodeHash: faker.random.uuid() });

    const data = {
      ticketId: invoiceTicket._id,
      piiHash: faker.random.uuid(),
      email: faker.internet.email(),
      comment: "this is a comment",
      batchNumber: "this is a batchNumber",
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(200);
        const ticket = InvoiceTickets.findOne();
        expect(ticket.productVendingInvitation.piiHash).to.equal(data.piiHash);
        expect(ticket.productVendingInvitation.email).to.equal(data.email);
        expect(ticket.productVendingInvitation.comment).to.equal(data.comment);
        expect(ticket.productVendingInvitation.batchNumber).to.equal(data.batchNumber);
        const ticketChangelog = ticket.changelog[1];
        expect(moment(ticket.updatedAt).format()).to.equal(moment(ticketChangelog.changedAt).format());
        expect(ticketChangelog.field).to.equal("productVendingInvitation");
        expect(ticketChangelog.value.piiHash).to.equal(data.piiHash);
        expect(ticketChangelog.value.email).to.equal(data.email);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('A second call without comments and batchNumber, removes the previous values', function(done) {
    console.log('A second call without comments and batchNumber, removes the previous values');
    // Setup test data
    const invoiceTicket = createInvoice.bind(this)( { productPasscodeHash: faker.random.uuid() });

    const data = {
      ticketId: invoiceTicket._id,
      piiHash: faker.random.uuid(),
      email: faker.internet.email(),
      comment: "this is a comment",
      batchNumber: "this is a batchNumber",
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(200);
        const ticket = InvoiceTickets.findOne();
        expect(ticket.productVendingInvitation.comment).to.equal(data.comment);

        delete data.comment;
        delete data.batchNumber;

        HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
          try {
            expect(response.statusCode).to.equal(200);
            const ticket = InvoiceTickets.findOne();
            expect(ticket.productVendingInvitation.comment).to.be.undefined
            expect(ticket.productVendingInvitation.batchNumber).to.be.undefined
            done();
          } catch (error) {
            console.log('Errors found', error);
            done(error);
          }
        });
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('set invoice Ticket piiHash for a valid ticket without optionals', function(done) {
    console.log('set invoice Ticket piiHash for a valid ticket without optionals');
    // Setup test data
    const invoiceTicket = createInvoice.bind(this)( { productPasscodeHash: faker.random.uuid() });

    const data = {
      ticketId: invoiceTicket._id,
      piiHash: faker.random.uuid(),
      email: faker.internet.email()
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(200);
        const ticket = InvoiceTickets.findOne();
        expect(ticket.productVendingInvitation.piiHash).to.equal(data.piiHash);
        expect(ticket.productVendingInvitation.email).to.equal(data.email);
        expect(ticket.productVendingInvitation.comment).to.be.undefined;
        expect(ticket.productVendingInvitation.batchNumber).to.be.undefined;
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

    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { }, (httpError, response) => {
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

  it('returns error 400 if no TicketId param in body', function(done) {
    console.log('returns error 400 if no TicketId param in body');

    const data = {
      piiHash: faker.random.uuid(),
      email: faker.internet.email()
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.equal('Malformed request body');
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
      ticketId: faker.random.uuid(),
      email: faker.internet.email()
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.equal('Malformed request body');
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 if no email param in body', function(done) {
    console.log('returns error 400 if no email param in body');

    const data = {
      ticketId: faker.random.uuid(),
      piiHash: faker.random.uuid()
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.equal('Malformed request body');
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 for invalid formated email param', function(done) {
    console.log('returns error 400 for invalid formated email param');

    const data = {
      ticketId: faker.random.uuid(),
      piiHash: faker.random.uuid(),
      email: 'not valid email'
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.equal('Invalid email format');
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 if Invoice Ticket not found for ticketId', function(done) {
    console.log('returns error 400 if Invoice Ticket not found for ticketId');

    const data = {
      ticketId: faker.random.uuid(),
      piiHash: faker.random.uuid(),
      email: faker.internet.email()
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.include('Invoice Ticket not found for ticketId');
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 if Invoice Ticket is not ready to set piiHash yet', function(done) {
    console.log('returns error 400 if Invoice Ticket is not ready to set piiHash yet');
    const invoiceTicket = createInvoice.bind(this)();

    const data = {
      ticketId: invoiceTicket._id,
      piiHash: faker.random.uuid(),
      email: faker.internet.email()
    };
    const headers = getAuthorizationHeaders();

    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.include('is not ready to set piiHash yet');
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns error 400 if Invoice Ticket has already been vended', function(done) {
    console.log('returns error 400 if Invoice Ticket is already vended');

    const invoiceTicket = createInvoice.bind(this)({ productPasscodeHash: faker.random.uuid(), hasVended: true });
    const data = {
      ticketId: invoiceTicket._id,
      piiHash: faker.random.uuid(),
      email: faker.internet.email(),
    };
    const headers = getAuthorizationHeaders();
    HTTP.post(`${Meteor.absoluteUrl()}/api/setInvoiceTicketPiiHash`, { data, headers }, (httpError, response) => {
      try {
        expect(response.statusCode).to.equal(400);
        expect(httpError.response.content).to.include('is already vended');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('Try to set piiHash returns error', function(done) {
    console.log('Try to set piiHash returns error');
    const invoiceTicket = Factory.create('invoiceTicket', { piiHash: 'not-allowed'});
    const storedTicket = InvoiceTickets.findOne(invoiceTicket._id);
    expect(storedTicket.piiHash).to.be.undefined;
    done();
  });

  it('Try to set productVendingInvitation piiHash returns error', function(done) {
    console.log('Try to set productVendingInvitation piiHash returns error');
    const invoiceTicket = Factory.create('invoiceTicket', { 'productVendingInvitation.piiHash': 'not-allowed'});
    const storedTicket = InvoiceTickets.findOne(invoiceTicket._id);
    expect(storedTicket.productVendingInvitation).to.be.undefined;
    done();
  });

});
