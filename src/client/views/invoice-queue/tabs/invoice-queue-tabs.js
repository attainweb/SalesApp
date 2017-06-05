TemplateController('invoiceQueueTabs', {
  props: new SimpleSchema({
    selected: {
      type: String
    },
    onTabChanged: {
      type: Function
    },
    counts: {
      type: Object,
      blackbox: true
    },
  }),
  helpers: {
    isSelected: function() {
      return (tab) => this.props.selected === tab;
    },
    onTabSelected: function() {
      return (tabClicked) => this.props.onTabChanged(tabClicked);
    },
    getCountValue() {
      return (tab) => this.props.counts[tab];
    },
    onMainFilterChanged() {
      return (value) => {
        this.setQueryParam('stateFilter', value);
      };
    },
    currentUser() {
      return Meteor.user();
    },
    hasRole(currentUser, validRoles) {
      if (!currentUser) return false;
      return _.contains(validRoles, currentUser.primaryRole());
    },
    salePendingValidRoles() {
      return ["headInvoiceManager"];
    },
    unpaidInvoicesValidRoles() {
      return ["headInvoiceManager", "bankManager"];
    },
    confirmBankAmountValidRoles() {
      return ["headInvoiceManager", "bankChecker"];
    },
    sentToBankCheckerValidRoles() {
      return ["headInvoiceManager", "bankManager"];
    },
    prepareBundleValidRoles() {
      return ["headInvoiceManager", "exporter"];
    },
    currentBundleValidRoles() {
      return ["headInvoiceManager", "exporter"];
    },
    bundleValidRoles() {
      return ["headInvoiceManager", "exporter"];
    },
    exportValidRoles() {
      return ["headInvoiceManager", "exporter"];
    },
    expiredValidRoles() {
      return ["headInvoiceManager", "bankManager"];
    },
    invalidFundsReceivedValidRoles() {
      return ["headInvoiceManager"];
    },
    btcOrdersValidRoles() {
      return ["headInvoiceManager"];
    },
    receiptSentValidRoles() {
      return ["headInvoiceManager"];
    },
    forceReserveValidRoles() {
      return ["headInvoiceManager"];
    }
  }
});
