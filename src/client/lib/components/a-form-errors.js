TemplateController('aFormErrors', {
  helpers: {
    formI18n: function( formId, error ) {
      let lookupKey = 'formErrors.' + formId + '.' + error.error;
      if (  error.error === 'same'
            || error.error === 'notAllowed'
            || error.error === 'unauthorized') {
        lookupKey = 'formErrors.' + error.error;
      } else if (error.error === 500) {
        lookupKey = 'formErrors.empty';
      }

      const msg = i18n(lookupKey, formId);
      if (msg) {
        return msg;
      }
      // This message should not be translated to other languages so we get notified when it happens
      return "Alert: I18n message missing for [" + formId + "][" + lookupKey + "]";
    }
  }
});
