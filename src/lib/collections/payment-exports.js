import { SortAndLimitChecker } from '/imports/lib/collections/check-query-methods';

Schemas.PaymentExport = new SimpleSchema([{
  invoiceTicketIds: {
    type: [String],
    label: i18n('paymentExports.invoiceTicketIds'),
  },
  holdingWalletAddress: {
    type: String,
    label: i18n('paymentExports.holdingWalletAddress'),
    defaultValue: 'false'
  },
  holdingWalletReceivedBtc: {
    type: Boolean,
    label: i18n('paymentExports.holdingWalletReceivedBtc'), 
    defaultValue: false
  },
  transactionId: {
    type: String,
    label: i18n('paymentExports.transactionId'),
    optional: true
  },
  jpyUsd: {
    type: Number,
    label: i18n('paymentExports.jpyUsd'),
    decimal: true,
    optional: true,
  },
  btcJpy: {
    type: Number,
    label: i18n('paymentExports.btcJpy'),
    decimal: true,
    optional: true,
  },
  btcUsd: {
    type: Number,
    label: i18n('paymentExports.btcUsd'),
    decimal: true,
    optional: true,
  },
  /*
     We add this field in order to avoid recalculation of the yenAmount
     every time the view show a bundle ticket.
     Obs: This field only uses for the view. For calculate batchFulfillmentAmount
     the system queries again for the amount of the tickets.
  */
  yenAmount: {
    type: Number,
    label: i18n('paymentExports.yenAmount'),
    decimal: true,
    optional: true,
  },
  batchFulfillmentAmount: {
    type: Number,
    label: i18n('paymentExports.batchFulfillmentAmount'),
    decimal: false,
    optional: true,
  },
  finalized: {
    type: Boolean,
    label: i18n('paymentExports.finalized'),
    defaultValue: false,
  },
  bundledAt: {
    type: Date,
    label: i18n('paymentExports.bundledAt'),
    autoValue: function autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          '$setOnInsert': new Date(),
        };
      }
      return this.unset();
    },
  },
  finalizedAt: {
    type: Date,
    label: i18n('paymentExports.finalizedAt'),
    optional: true,
  },
  lastDownloadedAt: {
    type: Date,
    label: i18n('paymentExports.lastDownloadedAt'),
    optional: true,
  },
}, Schemas.Basic]);

PaymentExports = new Mongo.Collection('paymentExports');
PaymentExports.attachSchema(Schemas.PaymentExport);

PaymentExports.helpers({
  ghostBtcUsd() {
    return Number( (this.btcJpy / this.jpyUsd).toFixed(4) );
  },
  invoiceTicketIds: function() {
    return this.invoiceTicketIds;
  }
});

const statesQueryMap = {
  'bundling': { finalized: false },
  'export': { finalized: true },
};

PaymentExports.findByStateAndQuery = function(state, query) {
  check(state, String);
  const filter = Object.assign({}, statesQueryMap[state]);
  if (!filter) throw new Error(`invalid payment exports state ${state} given.`);
  const options = SortAndLimitChecker.addSortAndLimitIfChecked(query);
  return PaymentExports.find(filter, options);
};




