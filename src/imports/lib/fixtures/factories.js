import faker from "faker";
import Commissions from '/imports/lib/collections/commissions';
import {
  generateTelnetBitcoinAddressWithDataset1,
  generateTelnetBitcoinAddressWithDataset2
} from '/imports/lib/fixtures/bitcoin-address-generator';

export const User = Factory.define('user', Meteor.users, {
  emails: () => {
    let address = faker.internet.email();
    return [{ address: address, verified: true }];
  },
  services: {},
  roles: [],
  personalInformation: {
    name: () => faker.name.firstName(),
    surname: () => faker.name.lastName(),
    companyName: () => faker.company.companyName(),
    registrationDate: () => faker.date.past(),
    phone: () => faker.phone.phoneNumber(),
    birthdate: () => faker.date.past(),
    refcode: () => faker.random.number({min: 5, max: 8}),
    status: 'APPROVED',
    accountType: 'personal',
    agreedToPolicyAt: {
      PRIVACY: [() => new Date()],
      TOC: [() => new Date()],
      RISK: [() => new Date()]
    },
    hasInvoiceWallet: true,
    invoiceWalletId: () => generateTelnetBitcoinAddressWithDataset1(),
    walletAddress: () => generateTelnetBitcoinAddressWithDataset2(),
    complianceLevel: () => faker.random.arrayElement([0, 1, 2, 3, 4]),
    applyingForComplianceLevel: () => faker.random.arrayElement([1, 2, 3, 4]),
    agreedToTOC: true,
    postAddress: {
      address: () => faker.address.streetAddress(),
      city: () => faker.address.city(),
      state: () => faker.address.state(),
      zip: () => faker.address.zipCode()
    }
  }
});

export const InvoiceTicket = Factory.define('invoiceTicket', InvoiceTickets, {
  buyerId: Factory.get('user', { roles: ['buyer'] } ),
  buyerApprovedAt: () => faker.date.past(),
  btcAddressAssignedAt: () => faker.date.past(),
  inviteApprovedAt: () => faker.date.past(),
  approvedInviteCanceledAt: () => faker.date.past(),
  invoiceSentAt: () => faker.date.past(),
  fundsReceivedConfirmedAt: () => faker.date.past(),
  fundsReceivedCanceledAt: () => faker.date.past(),
  satoshisExpectedAt: () => faker.date.past(),
  satoshisReceivedAt: () => faker.date.past(),
  receiptSentAt: () => faker.date.past(),
  state: 'started',
  btcAddress: () => generateTelnetBitcoinAddressWithDataset1(),
  paymentOption: () => faker.random.arrayElement(['Btc', 'Bank']),
  jpyUsd: () => faker.finance.amount(0.1),
  btcJpy: () => faker.finance.amount(0.1),
  btcUsd: () => faker.finance.amount(0.1),
  centsRequest: () => faker.finance.amount(0.1),
  centsAskPrice: () => faker.finance.amount(0.1),
  yenReceived: () => faker.finance.amount(0.1),
  satoshisExpected: () => faker.finance.amount(0.1),
  satoshisBought: () => faker.finance.amount(0.1),
  satoshisReceived: () => faker.finance.amount(0.1),
  fundsReceived: false,
  invoiceTransactionId: () => faker.random.uuid(),
  commissions: () => {[];}
});

export const Commission = Factory.define('commission', Commissions, {
  distributorId: () => Factory.get('user', { roles: ['distributor']}),
  ticketId: () => Factory.get('invoiceTicket'),
  invoiceNumber: () => faker.random.uuid(),
  buyerId: () => Factory.get('user', { roles: ['buyer'] }),
  originator: 'Buyer',
  payoutAmount: () => faker.finance.amount(),
  payoutTransactionId: () => faker.random.uuid(),
  paidAt: () => faker.date.past()
});

export const PaymentExport = Factory.define('paymentExport', PaymentExports, {
  invoiceTicketIds: () => [faker.random.uuid()],
  holdingWalletAddress: () => generateTelnetBitcoinAddressWithDataset1(),
  holdingWalletReceivedBtc: () => false,
  transactionId: () => generateTelnetBitcoinAddressWithDataset2(),
  jpyUsd: () => 10,
  btcJpy: () => 1000,
  btcUsd: () => 100,
  // batchFulfillmentAmount: () => faker.finance.amount(0, 1000, 0), // Duplicate key
  finalized: () => true,
  bundledAt: () => new Date(),
  finalizedAt: () => new Date(),
  lastDownloadedAt: () => undefined,
  batchFulfillmentAmount: 1000
});
