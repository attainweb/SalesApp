import { bankList } from '/imports/lib/shared/bank-list';
import {
  TimeFilterChecker, SearchFilterChecker, SortAndLimitChecker
} from '/imports/lib/collections/check-query-methods';

const newInvoiceNumber = function() {
  if (Meteor.isClient) {
    throw new Meteor.Error(500, 'Only use newInvoiceNumber() on the server');
  }
  const invNum = Autoincrements.nextValue('invoiceNumber') + "";
  return invNum;
};

Mongo.Collection.prototype.manualHelpers = function(helpers) {
  if (this._transform && !this._helpers) {
    throw new Meteor.Error(`Can't apply helpers to '${this._name}' a transform function already exists!`);
  }

  if (!this._helpers) {
    this._helpers = function Document(doc) { return _.extend(this, doc); };
    this._transform = (doc) => new this._helpers(doc);
  }

  _.each(helpers, (helper, key) => {
    this._helpers.prototype[key] = helper;
  });
};

const ProductVendingInvitationObject = new SimpleSchema({
  piiHash: {
    type: String,
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  comment: {
    type: String,
    optional: true,
  },
  batchNumber: {
    type: String,
    optional: true,
  }
});

const AvvmInformationObject = new SimpleSchema({
  productVendAddress: {
    type: String,
    optional: true,
  },
  hasLoggedIn: {
    type: Boolean,
    optional: true,
  },
  hasBasicInfo: {
    type: Boolean,
    optional: true,
  },
  hasPII: {
    type: Boolean,
    optional: true,
  },
  hasAuthenticatedEmail: {
    type: String,
    optional: true,
  },
});

Schemas.ProductVendingInvitationObject = ProductVendingInvitationObject;

// Changelog watched fields
// Please add fields here that you want to the changelog to watch and add to it's collection when they are modified
// You can use a * to watch for all child properties
const keepChangelogOf = [
  // 'productVendingInvitation' is added manually through rawCollection
  'productPasscodeHash'
];

Schemas.InvoiceTicket = new SimpleSchema([{
  buyerId: {
    type: String,
    label: i18n('invoiceTicket.buyerId'),
  },
  buyerApprovedAt: {
    type: Date,
    label: i18n('invoiceTicket.buyerApprovedAt'),
    optional: true,
  },
  btcAddressAssignedAt: {
    type: Date,
    label: i18n('invoiceTicket.btcAddressAssignedAt'),
    optional: true,
  },
  inviteApprovedAt: {
    type: Date,
    label: i18n('invoiceCard.inviteApprovedAt'),
    optional: true,
  },
  approvedInviteCanceledAt: {
    type: Date,
    label: i18n('invoiceCard.approvedInviteCanceledAt'),
    optional: true,
  },
  invoiceSentAt: {
    type: Date,
    label: i18n('invoiceCard.dates.sent'),
    optional: true,
  },
  fundsReceivedAt: {
    type: Date,
    label: i18n('invoiceCard.dates.received'),
    optional: true,
  },
  fundsReceivedConfirmedAt: {
    type: Date,
    label: i18n('invoiceCard.fundsReceivedConfirmedAt'),
    optional: true,
  },
  fundsReceivedCanceledAt: {
    type: Date,
    label: i18n('invoiceCard.fundsReceivedCanceledAt'),
    optional: true,
  },
  officerThatRequestPreCancel: {
    type: String,
    optional: true
  },
  canceledAt: {
    type: Date,
    optional: true
  },
  satoshisExpectedAt: {
    type: Date,
    optional: true,
  },
  satoshisReceivedAt: {
    type: Date,
    optional: true,
  },
  receiptSentAt: {
    type: Date,
    optional: true,
  },
  state: {
    type: String,
    label: i18n('invoiceTicket.state'),
    index: true,
    defaultValue: 'started',
  },
  invoiceNumber: {
    type: String,
    label: i18n('invoiceTicket.invoiceNumber'),
    unique: true,
    autoValue: function() {
      if (this.isInsert) {
        return newInvoiceNumber();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: newInvoiceNumber()
        };
      } else {
        return this.unset();
      }
    },
  },
  btcAddress: {
    type: String,
    label: i18n('invoiceTicket.btcAddress'),
    index: true,
    unique: true,
    optional: true,
  },
  paymentOption: {
    type: String,
    label: i18n('invoiceTicket.paymentOption'),
    optional: true,
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
  centsRequested: {
    type: Number,
    label: i18n('invoiceTicket.usdRequested'),
    optional: true,
  },
  centsAskPrice: {
    type: Number,
    optional: true,
  },
  yenReceived: {
    type: Number,
    label: i18n('invoiceTicket.yenReceived'),
    optional: true,
  },
  satoshisExpected: {
    type: Number,
    optional: true,
  },
  satoshisBought: {
    type: Number,
    label: i18n('invoiceTicket.satoshisBought'),
    optional: true,
  },
  satoshisReceived: {
    type: Number,
    optional: true,
  },
  fundsReceived: {
    type: Boolean,
    defaultValue: false
  },
  invoiceTransactionId: {
    type: String,
    optional: true
  },
  productAmount: {
    type: Number,
    optional: true,
  },
  commissionsMoved: {
    type: Boolean,
    defaultValue: false
  },
  commissions: {
    type: [Object, String],
    optional: true,
  },
  'commissions.$.distributorId': {
    type: String,
  },
  'commissions.$.payoutBtcAddress': {
    type: String
  },
  'commissions.$.payoutPercentage': {
    type: Number,
    decimal: true,
  },
  'commissions.$.payoutAmount': {
    type: Number,
    decimal: true
  },
  'commissions.$.payoutTransactionId': {
    type: String,
    optional: true
  },
  payoutTransactionId: {
    type: String,
    optional: true
  },
  comment: {
    type: String,
    optional: true,
  },
  bank: {
    type: String,
    allowedValues: bankList,
    optional: true,
  },
  productPasscode: {
    type: String,
    optional: true,
    denyInsert: true,
    denyUpdate: true
  },
  productPasscodeHash: {
    type: String,
    optional: true,
  },
  oldProductPasscodes: {
    type: [Object],
    optional: true,
    denyInsert: true,
    denyUpdate: true
  },
  tranche: {
    type: String,
    optional: true,
  },
  refundTransactionId: {
    type: String,
    optional: true
  },
  refundReason: {
    type: String,
    optional: true
  },
  refundedAt: {
    type: Date,
    optional: true
  },
  enqueuedEmailSentAt: {
    type: Date,
    optional: true
  },
  waitingForProductWhilePendingComplianceEmailSentAt: {
    type: Date,
    optional: true
  },
  productVendingInvitation: {
    type: ProductVendingInvitationObject,
    optional: true,
    autoValue: function() {
      this.unset();
    }
  },
  avvmInformation: {
    type: AvvmInformationObject,
    optional: true,
    autoValue: function() {
      this.unset();
    }
  },
  hasVended: {
    type: Boolean,
    optional: true,
    autoValue: function() {
      this.unset();
    }
  },
  invoiceTransactionSeenAt: {
    type: Date,
    optional: true
  },
  changelog: {
    type: [Object],
    blackbox: true,
    autoValue: function() {
      let changes = keepChangelogOf.map( (fieldName) => {
        const curField = this.field(fieldName);
        if (curField.isSet) {
          return {
            field: fieldName,
            changedAt: new Date(),
            value: curField.value,
          };
        }
        return undefined;
      }).filter((i) => !(typeof i === 'undefined' || typeof i === null) );

      if (this.isInsert) {
        return changes;
      } else {
        return {
          $push: {$each: changes}
        };
      }
    }
  },
  'changelog.$.field': {
    type: String,
  },
  'changelog.$.changedAt': {
    type: Date,
  },
  'changelog.$.value': {
    type: Object,
  },
}, Schemas.Basic]);

InvoiceTickets = new Mongo.Collection('invoiceTickets');

InvoiceTickets.paidStates = [
  'satoshisReceived', 'productPasscodeAssigned', 'receiptSent'
];

InvoiceTickets.finalizedStates = [
  'ticketFinalized', 'satoshisReceived', 'receiptSent'
];

InvoiceTickets.attachSchema(Schemas.InvoiceTicket);

InvoiceTickets.manualHelpers({
  updateComment: function(newComment, handlerError) {
    return Meteor.call('updateComment', this._id, newComment, function(err) {
      if (err) {
        handlerError(err);
      }
    });
  },
  fields: function(fieldNames) {
    const self = this;
    const fields = _.map(fieldNames, function(fieldName) {
      return { key: fieldName, value: self[fieldName] };
    });
    return fields;
  },
  buyer: function() {
    return Meteor.users.findOne(this.buyerId);
  },
  buyerFirstName: function() {
    const buyer = this.buyer();
    return buyer && buyer.firstName();
  },
  buyerLastName: function() {
    const buyer = this.buyer();
    return buyer && buyer.lastName();
  },
  buyerFullName: function() {
    const buyer = this.buyer();
    return buyer && buyer.fullName();
  },
  buyerEmail: function() {
    const buyer = this.buyer();
    return buyer && buyer.primaryEmail();
  },
  buyerLang: function() {
    const buyer = this.buyer();
    return buyer && buyer.lang();
  },
  bundle: function() {
    return PaymentExports.findOne({ invoiceTicketIds: this._id });
  },
  bundleId: function() {
    const bundle = this.bundle();
    return bundle && bundle._id;
  },
  processingFee: function(percentage) {
    // Default: 7.75% Fee
    const processingPercentage = percentage || 0.0775;
    return processingPercentage * this.usdRequested();
  },
  totalCostUsd: function(percentage) {
    return this.processingFee(percentage) + this.usdRequested();
  },
  usdRequested: function() {
    return this.centsRequested / 100;
  },
  btcExpected: function() {
    return this.satoshisExpected / 100000000;
  },
  btcReceived: function() {
    return this.satoshisReceived / 100000000;
  },
  btcExpectedPrice: function() {
    return this.centsAskPrice / 100;
  },
  isState: function(state) {
    return this.state === state;
  },
  isPaid: function() {
    return lodash.contains( InvoiceTickets.paidStates, this.state);
  },
  changeState: function(event, modifier, handlerError, handlerSuccess) {
    Meteor.call('changeState', event, this, modifier, function(err) {
      if (err && _.isFunction(handlerError)) {
        handlerError(err);
      } else if (_.isFunction(handlerSuccess)) {
        handlerSuccess();
      }
    });
  },
});

const statesQueryMap = {
  'salePending': {
    state: {
      $in: ['waitingForSaleToStart', 'saleStartedBtc', 'saleStartedBank']
    }
  },
  'unpaidBankInvoices': {
    state: {
      $in: ['invoiceSentBank']
    }
  },
  'confirmBankAmount': {
    state: {
      $in: ['fundsReceived']
    }
  },
  'sentToBankChecker': {
    state: {
      $in: ['fundsReceived']
    }
  },
  'preBundle': {
    state: {
      $in: ['fundsReceivedConfirmedSent']
    }
  },
  'currentBundle': {
    state: {
      $in: ['ticketPrepared']
    }
  },
  'bundling': {
    state: {
      $in: ['ticketBundled']
    }
  },
  'export': {
    state: {
      $in: ['ticketFinalized']
    }
  },
  'expiredInvoices': {
    state: {
      $in: ['invoiceExpired']
    }
  },
  'btcOrders': {
    state: {
      $in: ['btcAddressAssigned', 'saleStartedBtc', 'complianceApprovedBtc', 'invoiceSentBtc']
    },
    paymentOption: 'Btc'
  },
  'invalidFundsReceived': {
    state: { $in: ['invalidFundsReceived']
    }
  },
  'invalidTicketApproved': {
    state: { $in: ['invalidTicketApproved']
    }
  },
  'invalidFundsRefunded': {
    state: { $in: ['invalidFundsRefunded']
    }
  },
  'receiptSent': {
    state: {
      $in: ['satoshisReceived', 'productPasscodeAssigned', 'receiptSent']
    }
  },
  'forceReserve': {
    state: {
      $in: ['btcAddressAssigned', 'waitingForSaleToStart']
    }
  }
};

InvoiceTickets.findByStateAndQuery = function(state, query, options = {}) {
  check(state, String);
  check(query, Object);
  TimeFilterChecker.checkTimeFilter(query);
  SearchFilterChecker.checkSearchFilter(query);
  let filter = Object.assign({}, statesQueryMap[state]); // (!) set the correct state for the query
  if (!filter) throw new Error(`invalid invoice ticket state ${state} given.`);
  filter = TimeFilterChecker.addTimeFilterIfChecked(filter, query);
  filter = SearchFilterChecker.addSearchFilterIfChecked(filter, query);
  const opts = SortAndLimitChecker.addSortAndLimitIfChecked(query);
  return InvoiceTickets.find(filter, Object.assign({}, opts, options) );
};

InvoiceTickets.findByUser = function(userId, options = {}) {
  check(userId, String);
  return InvoiceTickets.find({buyerId: userId}, options);
};
