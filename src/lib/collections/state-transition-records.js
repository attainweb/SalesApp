
Schemas.StateTransitionRecord = new SimpleSchema([{
  invoiceTicketId: {
    type: String,
    label: i18n('stateTransitionRecord.invoiceTicketId'),
  },
  event: {
    type: String,
    label: i18n('stateTransitionRecord.event'),
  },
  managerId: {
    type: String,
    label: i18n('stateTransitionRecord.managerId'),
  },
}, Schemas.Basic]);

StateTransitionRecords = new Mongo.Collection('stateTransitionRecords');

StateTransitionRecords.attachSchema(Schemas.StateTransitionRecord);
