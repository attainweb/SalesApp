TemplateController('counterButton', {

  props: new SimpleSchema({
    label: { type: String },
    value: { type: String },
    count: { type: Function },
    isActive: { type: Function },
    onClicked: { type: Function },
    buttonId: {
      type: String,
      optional: true
    }
  }),

  helpers: {
    activeClass() {
      return this.props.isActive(this.props.value) ? 'active' : null;
    },
    count() {
      return this.props.count(this.props.value);
    }
  },

  events: {
    'click button'() {
      this.props.onClicked(this.props.value);
    }
  }

});
