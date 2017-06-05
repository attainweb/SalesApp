Schemas = typeof Schemas !== 'undefined' ? Schemas : {};

Schemas.withPassword = new SimpleSchema({
  password: {
    label: function() { return i18n('userInfo.editField.password.label'); },
    type: String,
  },
});
