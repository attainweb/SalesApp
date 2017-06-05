'use strict';

const I18N_ERROR_NAMESPACE = 'reGenerateProductPasscodes';

TemplateController('reGenerateProductPasscodes', {
  state: {
    statusMessage: Session.get('srefvalid') ? '' : `${I18N_ERROR_NAMESPACE}.errors.refCodeNotValid`,
    styleClass: ''
  },
  onCreated() {
    const refcode = this.data.refcode;
    let confirmAction;
    let confirmSuccessMessage;
    if (refcode) {
      switch (this.data.type) {
        case 're-generate-all':
          confirmAction = 'confirmRegenerateAllProductPasscodes';
          confirmSuccessMessage = `${I18N_ERROR_NAMESPACE}.success.confirmAll`;
          break;
        case 're-generate-one':
          confirmAction = 'confirmRegenerateProductPasscode';
          confirmSuccessMessage = `${I18N_ERROR_NAMESPACE}.success.confirmOne`;
          break;
        default: confirmAction = undefined;
      }
    }
    Meteor.call(confirmAction, refcode, (err) => {
      if (err) {
        this.state.statusMessage = `${I18N_ERROR_NAMESPACE}.errors.${err.error}`;
      } else {
        this.state.statusMessage = confirmSuccessMessage;
        this.state.styleClass = 'success';
      }
    });
  }
});
