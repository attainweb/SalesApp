import { confirmModal } from '/imports/client/confirm-modal';

TemplateController('buyerPurchases', {
  state: {
    isDisabled: false
  },
  onCreated() {
    this.state.isDisabled = false;
    Meteor.subscribe('invoicesByBuyerId');
  },
  helpers: {
    tickets() {
      return InvoiceTickets.findByUser(Meteor.userId());
    },
    isRegenerationAvailable() {
      return !! InvoiceTickets.find({canRegeneratePRODUCTPasscode: true}).count();
    }
  },
  events: {
    'click .request-regenerate-all-product-passcodes-button'(event) {
      event.preventDefault();
      this.state.isDisabled = true;
      // TODO: Make the warning message for 'modals.regenerateProductCodes' more nicely
      confirmModal(
        i18n('modals.regenerateProductCodes'),
        () => {
          Meteor.call('requestRegenerateAllProductPasscodes', (err) => {
            if (err) {
              bootbox.alert(i18n(`reGenerateProductPasscodes.errors.${err.error}`));
            } else {
              bootbox.alert(i18n(`reGenerateProductPasscodes.success.request`));
            }
          });
        },
        i18n('modals.buttons.regenerate'),
        ()=>{
          this.state.isDisabled = false;
        },
        'btn-danger',
      );
    }
  },
});
