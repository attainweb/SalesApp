import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'exportPaidInvoices';
TemplateController('invoiceBundleQueueRow', {
  state: {
    invoiceTickets: null
  },
  helpers: {
    rowItem() {
      return this.data.rowItem;
    },
    isBundle() {
      return this.data.actualState === 'bundling';
    },
    isExport() {
      return this.data.actualState === 'export';
    },
    hasContent() {
      return true;
    },
    invoiceTickets() {
      return this.state.invoiceTickets;
    },
    ticketItem() {
      return {
        ticket: this.data.rowItem
      };
    },
    onContentShown() {
      return () => {
        /*
          (!) Design decision:
          Because the bundle is already defined, the invoice tickets it contains
          wont't change, for that reason we used a Meteor.call instead a subcription.
          We don't believe reactivity is need it for this case, because we won't see any benefit
          The only drawback we see is that everytime user expands the collapsable tickets
          will be queried
        */
        Meteor.call('getBundleInvoiceTickets', this.data.rowItem, function(error, tickets) {
          if (error) {
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          }
          this.state.invoiceTickets = tickets;
        }.bind(this));
      };
    },
    cardType() {
      if (this.data.actualState === 'export') {
        return 'invoiceExportTicket';
      }
      return 'invoiceBundleTicket';
    },
    getActionCallback() {
      return this.data.actionCallback;
    }
  }
});
