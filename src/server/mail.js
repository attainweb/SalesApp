import { sendPasswordResetEmail } from '/imports/server/email-actions.js';
// Make some email sending methods available to client
Meteor.methods({ sendPasswordResetEmail });
