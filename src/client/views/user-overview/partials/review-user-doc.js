TemplateController('reviewUserDoc', {
  helpers: {
    overlayActiveClass: function() {
      return !this.isPending() ? 'active' : '';
    },
    disabledClass: function() {
      return this.isRejected() ? 'disabled' : '';
    },

    smallDocAttrs: function() {
      this.smallDocClasses = 'small-doc';
      return this;
    }
  },
  events: {
    'click .doc-img-overlay': function() {
      if (this.isPending()) {
        Router.go('reviewDoc', {_id: this._id});
      }
      if (this.isApproved()) {
        this.setPending();
      }
    }
  }
});
