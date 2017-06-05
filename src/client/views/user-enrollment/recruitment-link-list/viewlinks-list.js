TemplateController('viewlinksList', {
  helpers: {
    prefs: function() {
      return Template.instance().refs(this.data.reftype);
    }
  },
  onCreated() {
    const instance = this;
    instance.refs = function(reftype) {
      return Refs.find({ reftype: reftype }, { sort: { 'createdAt': -1 } }); // limit: instance.loaded.get()
    };
  }
});
