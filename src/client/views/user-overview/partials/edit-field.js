TemplateController('editField', {
  private: {
    fieldValue: function(field, doc) {
      let hierachy = field.split('.');
      let value = _.reduce(hierachy, function(memo, level) { return memo[level]; }, doc);
      return value;
    }
  },
  helpers: {
    updateButtonClass() {
      let submitButtonClassName =  this.data.field.split('.');
      submitButtonClassName = submitButtonClassName[submitButtonClassName.length - 1];
      if (submitButtonClassName === "residenceCountry") {
        submitButtonClassName = "residence-country";
      }
      return `update-${submitButtonClassName}`;
    },
    getFormId() {
      return this.data.field;
    },
    getFieldName() {
      return this.data.field;
    },
    getFieldValue() {
      return this.fieldValue(this.data.field, this.data.doc);
    },
    getSchema() {
      return this.data.schema;
    },
    getSaveButtonText() {
      return i18n('userInfo.editField.' + this.data.field + '.save');
    },
    getPasswordPlaceholder() {
      return i18n('userInfo.editField.password.placeholder');
    },
  },
  onCreated() {
    let hook = {};
    const field = this.data.field;
    const self = this;
    const parentAccessor = field.replace(".", "\\.");
    const fieldAccessor = `#${parentAccessor} :submit`;

    this.autorun(() => {
      this.data.schema.messages({
        ['same ' + this.data.field]: i18n('formErrors.same', field),
        incorrectPassword: i18n('formErrors.editEmailForm.incorrectPassword')
      });
    });

    hook[field] = {
      beginSubmit: function() {
        AutoForm.removeStickyValidationError(field, field);
        AutoForm.removeStickyValidationError(field, 'password');
        $(fieldAccessor).prop('disabled', true);
      },
      onSuccess: function() {
        this.formAttributes.successHandler(field);
      },
      onSubmit(insertDoc, updateDoc, currentDoc) {
        this.event.preventDefault();
        const oldValue = self.fieldValue(field, currentDoc).toString();
        const newValue = self.fieldValue(field, insertDoc).toString();
        const password = AutoForm.getFieldValue("password");
        if (newValue === oldValue) {
          AutoForm.addStickyValidationError(field, field, 'same');
          this.done(new Meteor.Error('same'));
        } else {
          Meteor.call('editField', field, insertDoc, password, (err) => {
            $(fieldAccessor).prop('disabled', false);
            if (!!err) {
              AutoForm.addStickyValidationError(field, 'password', 'incorrectPassword');
            } else {
              this.done();
            }
          });
        }
      }
    };
    // Replace the previously registered hooks (created() is called each time
    // this component is put on screen). API: AutoForm.hooks(hooks, replace)
    AutoForm.hooks(hook, true);
  },

});
