Schemas = typeof Schemas !== 'undefined' ? Schemas : {};

Schemas.Basic = new SimpleSchema({
  createdAt: {
    label: i18n('baseSchema.createdAt'),
    type: Date,
    autoform: {
      disabled: true
    },
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        return this.unset();
      }
    }
  },
  createdBy: {
    label: i18n('baseSchema.createdBy'),
    type: String,
    optional: true,
    autoform: {
      disabled: true
    },
    autoValue: function() {
      let lUserId;
      lUserId = void 0;
      lUserId = (this.isFromTrustedCode ? this.value : this.userId);
      if (this.isInsert) {
        return lUserId;
      } else if (this.isUpsert) {
        return { $setOnInsert: lUserId };
      } else {
        return this.unset();
      }
    }
  },
  updatedAt: {
    label: i18n('baseSchema.updatedAt'),
    type: Date,
    autoform: {
      disabled: true
    },
    autoValue: function() {
      if (this.isUpdate || this.isInsert || this.isUpsert) {
        return new Date();
      } else {
        return this.unset();
      }
    }
  },
  updatedBy: {
    label: i18n('baseSchema.updatedBy'),
    type: String,
    optional: true,
    autoform: {
      disabled: true
    },
    autoValue: function() {
      let lUserId;
      lUserId = void 0;
      lUserId = (this.isFromTrustedCode ? this.value : this.userId);
      if (this.isUpdate || this.isInsert || this.isUpsert) {
        return lUserId;
      } else {
        return this.unset();
      }
    }
  }
});
