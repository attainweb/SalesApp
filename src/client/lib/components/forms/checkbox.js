TemplateController('checkbox', {

  props: new SimpleSchema({
    label: { type: String },
    value: { type: String },
    isChecked: { type: Function },
    onToggled: { type: Function }
  }),

  helpers: {
    isChecked() {
      return this.props.isChecked(this.props.value);
    }
  },

  events: {
    'click input'() {
      this.props.onToggled(this.props.value);
    }
  }

});
