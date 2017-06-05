import { confirmModal } from '/imports/client/confirm-modal';

TemplateController('buyerPurchasesRow', {
  state: {
    isDisabled: false
  },
  onCreated() {
    this.state.isDisabled = false;
  },
  helpers: {
    ticketItem() {
      return {
        ticket: this.data.rowItem
      };
    },
    isRegenerationAvailable() {
      return !! this.data.rowItem.canRegeneratePRODUCTPasscode;
    }
  },
  events: {
    'click button.regenerate-product-code'(event) {
      event.preventDefault();
      this.state.isDisabled = true;
      const ticketId = this.data.rowItem._id;
      confirmModal(
        i18n('modals.regenerateProductCode'),
        () => {
          Meteor.call('requestRegenerateProductPasscode', ticketId, (err) => {
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
    },
  },
});
