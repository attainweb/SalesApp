import { emailEditSchema } from '/imports/lib/schemas/enrollment';

TemplateController('editEmail', {
  state: {
    formError: new ReactiveVar([])
  },
  events: {
  },
  helpers: {
    emailEditSchema() {
      return emailEditSchema;
    },
    formError: function() {
      return this.state.formError.get();
    },
    formErrorVar: function() {
      return this.state.formError;
    },
  }

});

AutoForm.hooks({
  editEmailForm: {
    beginSubmit: function() {
      this.formAttributes.formErrorVar.set([]);
    },
    onSuccess: function() {
      this.formAttributes.formErrorVar.set([]);
      this.formAttributes.successHandler();
    },
    onError: function(formType, error) {
      if (formType === "method") {
        this.formAttributes.formErrorVar.set([error]);
      }
    },
  }
});
