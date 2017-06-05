import {waitAndGetText, waitAndClickButton} from './webdriver';

export const expectAlertWithText = (expectedText, preProcessFn) => {

  const processFn = preProcessFn || ((it) => { return it; });
  // Wait until the dialog is on screen
  client.waitForVisible('.modal-dialog');
  client.waitForVisible(".bootbox", 20000);
  // Get the message that is actually displayed in the dialog on screen
  const dialogText = waitAndGetText('.modal-dialog .bootbox-body');
  // Check that the displayed message matches our expectation
  if (Array.isArray(dialogText)) {
    dialogText.forEach((text)=>{
      expect(processFn(text)).to.equal(processFn(expectedText));
    });
  } else {
    expect(processFn(dialogText)).to.equal(processFn(expectedText));
  }
};

const clickModal = (modalType) => {
  const modalIdentifier = `button[data-bb-handler=${modalType}]`;
  client.waitForVisible(`.modal-dialog ${modalIdentifier}`);
  waitAndClickButton(modalIdentifier);
  client.waitForVisible(`.bootbox ${modalIdentifier}`, 20000, true);
};

export const confirmModal = () => {
  clickModal('confirm');
};

export const approveModal = () => {
  clickModal('approve');
};

export const cancelModal = () => {
  clickModal('cancel');
};

export const okModal = () => {
  clickModal('ok');
};
