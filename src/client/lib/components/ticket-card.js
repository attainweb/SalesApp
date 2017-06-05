TemplateController('ticket_card', {

  state: {
    visible: false
  },
  events: {
    'click .ticket-card-panel-toggle'() {
      this.state.visible = !this.state.visible;
      if (this.state.visible) {
        if (this.data.onContentShown) {
          this.data.onContentShown();
        }
      }
    }
  },
  helpers: {
    hasContentClass() {
      return this.data.hasContent ? 'has-content' : 'without-content';
    },
    getCardId() {
      return this.data.cardId;
    }
  }
});
