TemplateController('usersComparison', {
  state: {
    expandedToggle: false,
  },
  events: {
    'click .btn-primary': function() {
      this.state.expandedToggle = !this.state.expandedToggle;
    },
    'mouseover .user-info tr': function(event, template) {
      const labelColumnClass = event.currentTarget.children[0].classList.item(0);
      template.$(`tr:has(.${labelColumnClass}) td`).addClass( "users-comparison-item-focus" );
    },
    'mouseout .user-info tr': function(event, template) {
      const labelColumnClass = event.currentTarget.children[0].classList.item(0);
      template.$(`tr:has(.${labelColumnClass}) td`).removeClass( "users-comparison-item-focus" );
    }
  }
});
