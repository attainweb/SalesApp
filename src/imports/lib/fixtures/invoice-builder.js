'use strict';

import faker from "faker";
import _ from 'lodash';

const addRandomBankToTicket = invoice => {
  const toReturn = Object.assign({}, invoice);
  if (toReturn.paymentOption === "Bank") {
    toReturn.bank = faker.random.arrayElement(["関西アーバン銀行", "三井住友銀行"]);
  }
  return toReturn;
};

export default class InvoiceBuilder {

  constructor(invoicedAndpaidStates) {
    const satoshis = faker.random.number();
    const cents = faker.random.number();
    this.invoice = {

      buyerId: faker.random.alphaNumeric(),
      centsRequested: faker.random.number(),
      paymentOption: faker.random.arrayElement(["Btc", "Bank"]),
      state: faker.random.arrayElement(invoicedAndpaidStates),
      invoiceNumber: faker.random.number(),
      fundsReceived: faker.random.boolean(),
      commissionsMoved: faker.random.boolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      btcAddressAssignedAt: faker.date.recent(),
      btcAddress: faker.finance.bitcoinAddress(),
      invoiceSentAt: faker.date.recent(),
      satoshisExpected: satoshis,
      satoshisExpectedAt: faker.date.recent(),
      centsAskPrice: cents,
      btcUsd: cents / 100,
      satoshisReceivedAt: faker.date.recent(),
      invoiceTransactionId: faker.random.alphaNumeric(),
      satoshisReceived: satoshis,
      productAmount: faker.random.number(),
      commissions: [
        {
          distributorId: faker.random.alphaNumeric(),
          payoutBtcAddress: faker.finance.bitcoinAddress(),
          payoutTransactionId: null,
          payoutPercentage: 1,
          payoutAmount: faker.random.number()
        }
      ],
      productPasscodeHash: faker.random.alphaNumeric(),
      receiptSentAt: faker.date.recent(),
      payoutTransactionId: faker.random.alphaNumeric(),
      tranche: faker.random.arrayElement(["t1", "t2", "t3"]),
    };

    this.invoice = addRandomBankToTicket(this.invoice);
    // This creates default withXXXX method for personalInformation object. This must be overriden in case of complex assignments
    // No lodash is used because we needed to add dev dependency just for this and we think it's not worthy right now
    Object.keys(this.invoice).forEach( personalInformationAttr => {
      const withAccesorName = _.camelCase(`with ${personalInformationAttr}`);
      this[withAccesorName] = _.isFunction(this[withAccesorName]) ? this[withAccesorName] : value => {
        this.invoice[personalInformationAttr] = value;
        return this;
      };
    });
  }

  withBuyerId(buyerId) {
    this.invoice.buyerId = buyerId;
    return this;
  }

  withState(state) {
    this.invoice.state = state;
    return this;
  }

  withPaymentOption(paymentOption) {
    this.invoice.paymentOption = paymentOption;
    this.invoice = addRandomBankToTicket(this.invoice);
    return this;
  }

  build() {
    return this.invoice;
  }
}
