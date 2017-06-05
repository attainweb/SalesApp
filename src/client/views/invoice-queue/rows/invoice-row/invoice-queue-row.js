TemplateController('invoiceQueueRow', {
  helpers: {
    rowItem() {
      return this.data.rowItem;
    },
    isUnpaid() {
      return this.data.actualState === 'unpaidBankInvoices';
    },
    isConfirmInvoicesPaid() {
      return this.data.actualState === 'confirmBankAmount';
    },
    isPreBundle() {
      return this.data.actualState === 'preBundle';
    },
    isCurrentBundle() {
      return this.data.actualState === 'currentBundle';
    },
    isBtcOrders() {
      return this.data.actualState === 'btcOrders';
    },
    isNoProductReserved() {
      return this.data.actualState === 'forceReserve';
    },
    isInvalidFundsReceived() {
      return this.data.actualState === 'invalidFundsReceived';
    },
    hasContent() {
      switch (this.data.actualState) {
        case "unpaidBankInvoices":
        case "confirmBankAmount":
        case "preBundle":
        case "currentBundle":
        case "btcOrders":
        case "forceReserve":
        case "invalidFundsReceived":
          return true;
        default:
          return false;
      }
    },
    ticketItem() {
      return {
        ticket: this.data.rowItem
      };
    },
    getActionCallback() {
      return this.data.actionCallback;
    }
  }
});
