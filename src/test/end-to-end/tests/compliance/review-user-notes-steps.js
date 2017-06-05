import { waitAndClickButton, waitAndSetValue } from '/test/end-to-end/tests/_support/webdriver';

module.exports = function() {

  this.When(/^I add (.*) as a note to the user$/, function(noteType) {
    waitAndSetValue("#" + noteType + "-comment", "note");
    waitAndClickButton("#add-" + noteType);
    const note = {};
    note[noteType] = "note";
  });


  this.Then(/^I see the (.*) note I wrote to the notApprovedBuyer$/, function(noteType) {
    const selector = '.user-' + noteType + ' td';
    client.waitForText(selector);
    let notesTexts = client.getText(selector);
    expect(notesTexts).to.include('comment: note');
  });

  this.Given(/^the (.*) has the following notes assigned:$/, function(role, data) {
    const user = this.accounts.getUserByKey(role);
    this.notes = data.hashes();
    const baseNote = {
      name: this.user.personalInformation.name,
      userId: this.user.id,
      role: "compliance",
      createdAt: new Date()
    };
    // add calls to user
    server.execute((userId, call, notes) => {
      const { addUserNote } = require('/imports/server/users/compliance.js');
      notes.forEach((note) => {
        call.comment = note.call;
        call.type = 'call';
        addUserNote(userId, call);
      });
    }, user.id, baseNote, this.notes);
    // add web checks to user
    server.execute((userId, webCheck, notes) => {
      const { addUserNote } = require('/imports/server/users/compliance.js');
      notes.forEach((note) => {
        webCheck.comment = note.webCheck;
        webCheck.type = 'webCheck';
        addUserNote(userId, webCheck);
      });
    }, user.id, baseNote, this.notes);
    // add customer service notes to user
    server.execute((userId, customerServiceNote, notes) => {
      const { addUserNote } = require('/imports/server/users/compliance.js');
      notes.forEach((note) => {
        customerServiceNote.comment = note.customerServiceNote;
        customerServiceNote.type = 'customerServiceNote';
        addUserNote(userId, customerServiceNote);
      });
    }, user.id, baseNote, this.notes);
    // add customer service notes to user
    server.execute((userId, customerServiceNote, notes) => {
      const { addUserNote } = require('/imports/server/users/compliance.js');
      notes.forEach((note) => {
        customerServiceNote.comment = note.customerServiceNote;
        customerServiceNote.type = 'customerServiceNote';
        addUserNote(userId, customerServiceNote);
      });
    }, user.id, baseNote, this.notes);
  });

}