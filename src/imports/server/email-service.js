const MAILGUN_API_URL = 'https://api.mailgun.net/v3';
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_USER = 'info@' + MAILGUN_DOMAIN;
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;

// As we cannot send a function as xolvio:backdoor parameter we need to require the stub
// from ServerSide code (inside server.execute). To be able to do so the email-stub.js
// need to be bundled inside server js code. Maybe we can export this as a package and
// flag this with testOnly
require('/imports/lib/fixtures/email-stub.js');

const mailgunEmailService = function(to, subject, text, bcc) {
  const parts = {
    "from": MAILGUN_USER,
    "to": to,
    "subject": subject,
    "text": text
  };

  if (bcc) parts.bcc = bcc;

  if (Meteor.settings.public.development) parts["o:testmode"] = true;

  const formData = CustomMultipartForm(parts);
  const postURL = MAILGUN_API_URL + '/' + MAILGUN_DOMAIN + '/messages';
  const options = {
    auth: "api:" + MAILGUN_API_KEY,
    headers: formData.headers,
    content: formData.content
  };
  HTTP.call('POST', postURL, options, function onError(error) {
    if (error) throw new Meteor.Error('500', '[Error] sendEmail: ' + error);
  });
  return true;
};

let sendAction = mailgunEmailService;

export const sendEmail = function(emailAddress, subject, emailText, bcc) {
  return sendAction.call(this, emailAddress, subject, emailText, bcc);
};

export const configure = function(emailService) {
  sendAction = emailService;
};
