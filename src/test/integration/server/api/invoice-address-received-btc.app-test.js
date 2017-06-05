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
    state: 'ticketFinalized',
    satoshisExpected: 1000,
    btcAddress: '3E5sH77vAgw3gQq4zpuZ8XyXrjVbTcEYRG',
    invoiceTransactionId: undefined,
    satoshisReceived: undefined,
    fundsReceived: undefined
  };
  return Factory.create('invoiceTicket', Object.assign({}, defaultModifier, modifier));
};

describe('invoiceAddressReceivedBtc', function() {

  // Set default timeout for this suite to 5 seconds to avoid fails on CI
  this.timeout(5000);
  console.log('invoiceAddressReceivedBtc');
  beforeEach(function() {
    resetDatabase();
    insertAutoincrements();
  });

  it('stores commissions for a valid ticket', function(done) {
    console.log('stores commissions for a valid ticket');
    // Setup test data
    const invoiceTicket = createInvoice.bind(this)();
    const distributor = this.distributor;

    const data = {
      satoshisReceived: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid(),
      confirmations: 1
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError, response) => {
      try {
        const ticket = InvoiceTickets.findOne();
        expect(ticket.commissions).to.deep.equal([{
          distributorId: distributor._id,
          payoutBtcAddress: distributor.personalInformation.walletAddress,
          payoutPercentage: 1,
          payoutAmount: 200
        }]);
        expect(response.statusCode).to.equal(200);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('changes ticket state for a valid ticket', function(done) {
    console.log('changes ticket state for a valid ticket');
   // Setup test data
    const invoiceTicket = createInvoice.bind(this)();

    const data = {
      satoshisReceived: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid(),
      confirmations: 1
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError, response) => {
      try {
        const ticket = InvoiceTickets.findOne();
        expect(ticket.state).to.equal('satoshisReceived');
        expect(response.statusCode).to.equal(200);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('does not changes ticket state for a 0 confirmations but sets transactionId', function(done) {
    console.log('does not changes ticket state for a 0 confirmations but sets transactionId');
    // Setup test data
    const invoiceTicket = createInvoice.bind(this)();

    const data = {
      satoshisReceived: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid(),
      confirmations: 0
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError, response) => {
      try {
        const ticket = InvoiceTickets.findOne(invoiceTicket._id);
        expect(ticket.state).to.not.equal('satoshisReceived');
        expect(ticket.invoiceTransactionId).to.equal(data.transactionId);
        expect(ticket.satoshisReceived).to.equal(data.satoshisReceived);
        expect(ticket.invoiceTransactionSeenAt).to.exist;
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
    console.log('returns 400 for a malformed request body');
    const data = {};

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        expect(httpError.response.content).to.equal('Malformed request body');
        expect(httpError.response.statusCode).to.equal(400);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 400 for an invalid bitcoin address', function(done) {
    console.log('returns 400 for an invalid bitcoin address');
    const data = {
      satoshisReceived: 1000,
      invoiceAddress: 'invalidAddress',
      transactionId: faker.random.uuid()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        expect(httpError.response.content).to.equal('Invalid bitcoin address, invoiceWalletAddress: invalidAddress');
        expect(httpError.response.statusCode).to.equal(400);
        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 400 for an invalid confirmations value', function(done) {
    console.log('returns 400 for an invalid confirmations value');
    const invoiceTicket = createInvoice.bind(this)();

    const data = {
      satoshisReceived: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid(),
      confirmations: "text"
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        expect(httpError.response.content).to.equal('Invalid confirmations, must be a positive integer value: text');
        expect(httpError.response.statusCode).to.equal(400);

        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });


  it('returns 556 for a non existent invoice ticket', function(done) {
    console.log('returns 556 for a non existent invoice ticket');

    const btcAddress = '3E5sH77vAgw3gQq4zpuZ8XyXrjVbTcEYRG';
    const data = {
      satoshisReceived: 1000,
      invoiceAddress: btcAddress,
      transactionId: faker.random.uuid()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        expect(httpError.response.content).to.equal( "Ticket not found for address: " + btcAddress);
        expect(httpError.response.statusCode).to.equal(556);

        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  const testStates = ['invoiceCanceled', 'invoicePreCanceled'];
  testStates.forEach(function(state) {
    it(`returns 586 for a ${state} ticket`, function(done) {
      // Setup test data
      const invoiceTicket = createInvoice.bind(this)({ state: state });

      const data = {
        satoshisReceived: 1000,
        invoiceAddress: invoiceTicket.btcAddress,
        transactionId: faker.random.uuid()
      };

      HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
        try {
          const ticket = InvoiceTickets.findOne();
          expect(httpError.response.content).to.equal("Ticket at address: " + ticket.btcAddress + " has been cancelled.");
          expect(httpError.response.statusCode).to.equal(586);
          console.log('No errors found');
          done();
        } catch (error) {
          console.log('Errors found', error);
          done(error);
        }
      });
    });
  });

  it('returns 587 for a ticket that already received funds', function(done) {
    console.log('returns 587 for a ticket that already received funds');

    // Setup test data
    const invoiceTicket = createInvoice.bind(this)({ state: 'ticketFinalized', fundsReceived: true });

    const data = {
      satoshisReceived: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        const ticket = InvoiceTickets.findOne();

        expect(httpError.response.content).to.equal("Ticket at address: " + ticket.btcAddress + " already received Satoshis.");
        expect(httpError.response.statusCode).to.equal(587);

        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 589 for a ticket with invalid bitstamp prices', function(done) {
    console.log('returns 589 for a ticket with invalid bitstamp prices');

    // Setup test data
    const invoiceTicket = createInvoice.bind(this)({ satoshisExpected: undefined, paymentOption: 'Btc' });

    const data = {
      satoshisReceived: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        const ticket = InvoiceTickets.findOne();

        expect(httpError.response.content).to.equal("Bitstamp prices not valid for ticket " + ticket._id + " having address " + ticket.btcAddress);
        expect(httpError.response.statusCode).to.equal(589);

        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 549 when receiving an invalid satoshis amount for a BTC ticket and invalidates ticket', function(done) {
    console.log('returns 549 when receiving an invalid satoshis amount for a BTC ticket and invalidates ticket');

    // Setup test data
    const invoiceTicket = createInvoice.bind(this)({ state: 'invoiceSentBtc', paymentOption: 'Btc'});

    const data = {
      satoshisReceived: invoiceTicket.satoshisExpected * 2,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid(),
      confirmations: 1
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        const ticket = InvoiceTickets.findOne(invoiceTicket._id);

        expect(httpError.response.content).to.equal("Amount received is invalid for ticket " + ticket._id + " having address: " + ticket.btcAddress);
        expect(httpError.response.statusCode).to.equal(549);

        expect(ticket.state, 'invalidFundsReceived');
        expect(ticket.satoshisReceived, data.satoshisReceived);
        expect(ticket.fundsReceived).to.be.true;
        expect(ticket.fundsReceivedAt).to.be.present;

        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 549 when invalid satoshis amount for a BTC ticket on zero confirmations and invalidates ticket', function(done) {
    console.log('returns 549 when invalid satoshis amount for a BTC ticket on zero confirmations and invalidates ticket');

    // Setup test data
    const invoiceTicket = createInvoice.bind(this)({ state: 'invoiceSentBtc', paymentOption: 'Btc'});

    const data = {
      satoshisReceived: invoiceTicket.satoshisExpected * 2,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid(),
      confirmations: 0
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        const ticket = InvoiceTickets.findOne(invoiceTicket._id);

        expect(httpError.response.content).to.equal("Amount received is invalid for ticket " + ticket._id + " having address: " + ticket.btcAddress);
        expect(httpError.response.statusCode).to.equal(549);

        expect(ticket.state, 'invalidFundsReceived');
        expect(ticket.satoshisReceived, data.satoshisReceived);
        expect(ticket.fundsReceived).to.be.equal(invoiceTicket.fundsReceived);
        expect(ticket.invoiceTransactionSeenAt).to.be.present;

        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 549 when invalid satoshis amount for 0-confirmations and then 1-confirmation', function(done) {
    console.log('returns 549 when invalid satoshis amount for 0-confirmations and then 1-confirmation');

    // Setup test data
    const modifier = { state: 'invoiceSentBtc', paymentOption: 'Btc', fundsReceived: false, fundsReceivedAt: new Date() };
    const invoiceTicket = createInvoice.bind(this)(modifier);

    const data = {
      satoshisReceived: invoiceTicket.satoshisExpected * 2,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid(),
      confirmations: 0
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        const ticket1 = InvoiceTickets.findOne(invoiceTicket._id);

        expect(httpError.response.content).to.equal("Amount received is invalid for ticket " + ticket1._id + " having address: " + ticket1.btcAddress);
        expect(httpError.response.statusCode).to.equal(549);

        expect(ticket1.state, 'invalidFundsReceived');
        expect(ticket1.satoshisReceived, data.satoshisReceived);
        expect(ticket1.fundsReceived).to.be.false;
        expect(ticket1.invoiceTransactionSeenAt).to.be.present;

        // Second call is for 1 confirmation
        data.confirmations = 1;

        HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
          try {
            const ticket2 = InvoiceTickets.findOne(invoiceTicket._id);

            expect(httpError.response.content).to.equal("Amount received is invalid for ticket " + ticket2._id + " having address: " + ticket2.btcAddress);
            expect(httpError.response.statusCode).to.equal(549);

            expect(ticket2.state, 'invalidFundsReceived');
            // Now funds received should be true
            expect(ticket2.fundsReceived).to.be.true;
            expect(ticket2.fundsReceivedAt).to.be.present;

            console.log('No errors found');
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

  it('returns 549 when invalid satoshis amount for 1-confirmations and then 0-confirmation', function(done) {
    console.log('returns 549 when invalid satoshis amount for 1-confirmations and then 0-confirmation');

    // Setup test data
    const modifier = { state: 'invoiceSentBtc', paymentOption: 'Btc', fundsReceived: false, fundsReceivedAt: new Date() };
    const invoiceTicket = createInvoice.bind(this)(modifier);

    const data = {
      satoshisReceived: invoiceTicket.satoshisExpected * 2,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid(),
      confirmations: 1
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        const ticket1 = InvoiceTickets.findOne(invoiceTicket._id);

        expect(httpError.response.content).to.equal("Amount received is invalid for ticket " + ticket1._id + " having address: " + ticket1.btcAddress);
        expect(httpError.response.statusCode).to.equal(549);

        expect(ticket1.state, 'invalidFundsReceived');
        expect(ticket1.satoshisReceived, data.satoshisReceived);
        expect(ticket1.fundsReceived).to.be.true;
        expect(ticket1.fundsReceivedAt).to.be.present;

        // Second call is for 0 confirmation
        data.confirmations = 0;

        HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
          try {
            const ticket2 = InvoiceTickets.findOne(invoiceTicket._id);

            expect(httpError.response.content).to.equal("Amount received is invalid for ticket " + ticket2._id + " having address: " + ticket2.btcAddress);
            expect(httpError.response.statusCode).to.equal(549);

            expect(ticket2.state, 'invalidFundsReceived');
            // Funds received should remain true
            expect(ticket2.fundsReceived).to.be.true;
            expect(ticket2.fundsReceivedAt).to.be.present;
            expect(ticket2.invoiceTransactionSeenAt).to.be.present;

            console.log('No errors found');
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

  it('return 549 for a ticket in state invalidFundsReceived', function(done) {
    console.log('return 549 for a ticket in state invalidFundsReceived');

    // Setup test data
    const modifier = {
      state: 'invalidFundsReceived',
      paymentOption: 'Btc',
      satoshisReceived: 1000,
      fundsReceived: true,
      fundsReceivedAt: new Date()
    };
    const invoiceTicket = createInvoice.bind(this)(modifier);

    const fundsReceivedAt = invoiceTicket.fundsReceivedAt;

    const data = {
      satoshisReceived: invoiceTicket.satoshisReceived * 2,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError, response) => {
      try {
        const ticket = InvoiceTickets.findOne();
        expect(response.statusCode).to.equal(549);
        expect(ticket.fundsReceivedAt.getTime()).to.equal(fundsReceivedAt.getTime());

        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 500 for a ticket with an invalid state', function(done) {
    console.log('returns 500 for a ticket with an invalid state');

    // Setup test data
    const invoiceTicket = createInvoice.bind(this)({ state: 'invalidState'});

    const data = {
      satoshisReceived: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        const ticket = InvoiceTickets.findOne();

        expect(httpError.response.content).to.equal("Can\"t calculate commission for ticket with id: " + ticket._id + ". Invalid Ticket State: " + ticket.state);
        expect(httpError.response.statusCode).to.equal(500);

        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 595 if the ticket has already been refunded', function(done) {
    console.log('returns 595 if the ticket has already been refunded');

    // Setup test data
    const invoiceTicket = createInvoice.bind(this)({ state: 'invalidFundsRefunded', paymentOption: "Btc" });

    const data = {
      satoshisReceived: invoiceTicket.satoshisExpected * 2,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, (httpError) => {
      try {
        const ticket = InvoiceTickets.findOne();

        expect("Funds have been refunded for this ticket " + ticket._id).to.equal(httpError.response.content);
        expect(httpError.response.statusCode).to.equal(595);

        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('changes ticket state to satoshisReceived for tickets in state invalidTicketApproved', function(done) {
    console.log('changes ticket state to satoshisReceived for tickets in state invalidTicketApproved');

    // Setup test data
    const invoiceTicket = createInvoice.bind(this)({ state: 'invalidTicketApproved' });

    const data = {
      satoshisReceived: 1000,
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: faker.random.uuid()
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/invoiceAddressReceivedBtc`, { data }, () => {
      try {
        const ticket = InvoiceTickets.findOne();

        expect(ticket.state).to.equal('satoshisReceived');

        console.log('No errors found');
        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });
});


