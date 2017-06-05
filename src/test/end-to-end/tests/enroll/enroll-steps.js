import faker from "faker";
import { waitAndClickButton, waitAndSetValue, waitAndSelect, waitAndCheck, waitAndUncheck, waitAndGetValue, waitAndGetText } from '../_support/webdriver';
import { okModal } from '/test/end-to-end/tests/_support/alerts';
import { i18nTest } from '../_support/i18n';
import { waitForEmails, resetHistory } from '../_support/emails';
import { expectAlertWithText } from '../_support/alerts';
import { _ } from 'lodash';
import { getMeteorSettings } from '/test/end-to-end/tests/_support/helpers.js';


const productName = function() {
  return getMeteorSettings().public.productName.en;
};

module.exports = function() {

  let formValues = undefined;
  let residenceSelectionData;

  const clickNextButton = () => {
    waitAndClickButton(".wizard-next-button.ui.button");
  };

  const completeContactInformationForm = function(values, enterVerificationCode = true, clickNext = true) {

    const inputKeys = Object.getOwnPropertyNames(values.inputValues);
    inputKeys.forEach((inputKey) => {
      let inputClass = "input[name=" + inputKey + "]";
      waitAndSetValue(inputClass, values.inputValues[inputKey]);
    });

    const selectKeys = Object.getOwnPropertyNames(values.selectValues);
    selectKeys.forEach((selectKey) => {
      let selectClass = "select[name= " + selectKey + "]";
      waitAndSelect(selectClass, values.selectValues[selectKey]);
    });
    if (values.checkboxValues.isZipCodeCorrect) {
      waitAndCheck("input[name=apiInvalidZip]");
    } else {
      waitAndUncheck("input[name=apiInvalidZip]");
    }

    if (values.checkboxValues.acceptPolicy) {
      waitAndCheck("input[name=acceptPolicy]");
    } else {
      waitAndUncheck("input[name=acceptPolicy]");
    }
    formValues = values;

    if (enterVerificationCode) {
      const completedEmail = waitAndGetValue("input[name=email]");
      waitAndClickButton("#sendEmailVerificationCode");
      okModal();
      const emailVerificationCode = waitAndGetVerificationCode(completedEmail);
      waitAndSetValue("input[name=emailVerificationCode]", emailVerificationCode);
    }

    if (clickNext) {
      clickNextButton();
    }
  };

  const waitAndGetVerificationCode = function(completedEmail) {
    const emailHistory = waitForEmails();
    const emailVerificationCode = emailHistory[0];
    expect(emailVerificationCode.to).to.equal(completedEmail);
    expect(emailVerificationCode.subject).to.equal(i18nTest('emailSubjects.emailVerificationCode'));
    expect(emailVerificationCode.bcc).to.contain(process.env.COMPANY_BCC_EMAIL);
    const emailText = emailVerificationCode.text;
    let refcode = emailText.substr(emailText.indexOf(':'));
    refcode = refcode.substr(2, refcode.indexOf('.') - 1);
    resetHistory();
    return refcode;
  };

  const completeAgreementsForm = function(values) {
    if (values.acceptToc) {
      waitAndCheck("input[name=acceptToc]");
    }
    if (values.acceptRisk) {
      waitAndCheck("input[name=acceptRisk]");
    }
    clickNextButton();
  };

  const completeResidenceSelectionForm = function(values) {
    residenceSelectionData = values;
    waitAndSelect("select[name=language]", values.language);
    waitAndSelect("select[name=residenceCountry]", values.residenceCountry);
    if (residenceSelectionData.agreedToDocumentsInEnglish) {
      waitAndCheck("input[name=agreedToDocumentsInEnglish]");
    }
    clickNextButton();
  };

  const countryCustomizations = function(countryCode) {
    const result = {};
    const residenceCountry = countryCode || residenceSelectionData.residenceCountry;
    switch (residenceCountry) {
      case 'KR':
        result.omissions = { inputValues: ['state'] };
        break;
      default:
        break;
    }
    return result;
  };

  const createDefaultFormInputData = function(role, toOverride, toOmit) {
    const countryCustom = countryCustomizations();
    const overrides = _.merge(toOverride, countryCustom.overrides);
    const omissions = _.merge(toOmit, countryCustom.omissions);
    const email = faker.internet.email().toLowerCase();
    const information = {
      inputValues: {
        surname: faker.name.lastName(),
        firstname: faker.name.firstName(),
        email: email,
        phone: faker.phone.phoneNumber(),
        birthdate: "2016-06-09",
        zip: faker.address.zipCode(),
        state: faker.address.state(),
        city: faker.address.city(),
        address: faker.address.streetAddress(),
      },
      selectValues: {
        accountType: "personal"
      },
      checkboxValues: {
        acceptPolicy: true,
        isZipCodeCorrect: true
      }
    };

    if (role === 'buyer') {
      information.inputValues = Object.assign(information.inputValues, {productAmount: 1000});
      information.selectValues = Object.assign(information.selectValues, {paymentMethod: "Btc"});
    }

    if (overrides) {
      information.inputValues = Object.assign(information.inputValues, overrides);
    }

    if (omissions) {
      omissions.inputValues && omissions.inputValues.forEach(function(field) {
        delete information.inputValues[field];
      });

      omissions.selectValues && omissions.selectValues.forEach(function(field) {
        delete information.selectValues[field];
      });

      omissions.checkboxValues && omissions.checkboxValues.forEach(function(field) {
        delete information.checkboxValues[field];
      });
    }

    return information;
  };

  const expectErrorMessages = function(messages) {
    const errorSelector = '.form-group.has-error .help-block';
    if (messages) {
      messages.forEach(function(errorMessage, index) {
        client.waitForText(errorSelector);
        let errorSelectorText = client.getText(errorSelector);
        if (typeof errorSelectorText === "string") {
          errorSelectorText = errorSelectorText.split();
        }
        expect(errorSelectorText[index]).to.equal(errorMessage);
      });
    } else {
      client.waitForVisible(errorSelector);
    }
  };

  const createDefaultRefCodeInputData = function(role, originatorId) {
    let information = {
      clicked: 0,
      reftype: role,
      timetype: "onetime",
      name: "",
      notes: "",
      originatorId: (originatorId === undefined) ? "22ThpRGZtdKxRBKFp" : originatorId,
      createdAt: new Date(),
      isActive: true,
    };
    if (role === 'distributor') {
      information = Object.assign(information, {distlevel: 2});
    }
    return information;
  };


  this.Given(/^There is a (.*) enroll link created$/, function(roleParam) {
    let role = roleParam;
    if (role === undefined) role = "buyer";
    const distributor = this.accounts.getUserByKey('approvedDistributor');
    const options = createDefaultRefCodeInputData(role, distributor._id);
    const ref = server.execute(function(params) {
      const genRefcode = require('/imports/lib/shared/refs').genRefcode;
      const refCode = genRefcode();
      params.refcode = refCode;
      return Refs.create(params);
    }, options);
    this.refcode = ref.refcode;
  });

  this.Given(/^There is a (.*) enroll link created with (.*) as originator$/, function(roleParam, originatorKey) {
    let role = roleParam;
    if (role === undefined) role = "buyer";
    const originator = this.accounts.getUserByKey(originatorKey);
    const options = createDefaultRefCodeInputData(role, originator._id);
    const ref = server.execute(function(params) {
      const genRefcode = require('/imports/lib/shared/refs').genRefcode;
      const refCode = genRefcode();
      params.refcode = refCode;
      return Refs.create(params);
    }, options);
    this.refcode = ref.refcode;
  });

  this.Given(/I go to enroll screen/, function() {
    client.execute(() => {
      // Session will be not defined for enroll individual test, expected "ReferenceError" exception
      try { Session.clear(); } catch (e) { console.log(e); }
    });
    this.router.visit(`enroll/${this.refcode}/residence-selection`);
  });

  this.When(/^I finish completing residence selection$/, function() {
    completeResidenceSelectionForm({
      language: "en",
      residenceCountry: "JP",
    });
  });

  this.When(/^I complete residence selection with country (.*)$/, function(country) {
    const residenceCountryData = {
      language: "en",
      residenceCountry: country
    };
    if (country === 'VN') residenceCountryData.agreedToDocumentsInEnglish = true;
    completeResidenceSelectionForm(residenceCountryData);
  });

  this.When(/^I finish completing residence selection with a non Japanese country$/, function() {
    completeResidenceSelectionForm({
      language: "en",
      residenceCountry: "US",
    });
  });

  this.Then(/I should not see a payment method drop down/, function() {

    expect(client.isVisible("select[name=paymentMethod]")).to.equal(false);
  });

  this.When(/^I finish completing contact information for (.*) for an amount of (\d+) with (.*)$/, function(role, amount, paymentMethod) {
    const data = createDefaultFormInputData(role, undefined, {
      productAmount: amount,
      paymentMethod: paymentMethod
    });
    completeContactInformationForm(data);
  });

  this.When(/^I finish completing contact information for ([a-zA-Z]*)$/, function(role) {
    const data = createDefaultFormInputData(role, undefined, { selectValues: ["paymentMethod"] });
    completeContactInformationForm(data, true, undefined);
  });

  this.When(/^I complete contact information for distributor with email test@company.com$/, function() {
    const data = createDefaultFormInputData('distributor', {
      email: 'test@company.com',
    }, undefined);
    completeContactInformationForm(data, true, undefined);
  });

  this.When(/^I complete contact information for (.*) without clicking next(.*)$/, function(role, withoutVerificationCode) {
    const data = createDefaultFormInputData(role, undefined, {
      inputValues: [],
      selectValues: ["paymentMethod"]
    });
    const doWithoutVerificationCode = !!!withoutVerificationCode;
    completeContactInformationForm(data, doWithoutVerificationCode, false);
  });

  this.When(/^I complete contact information for ([a-zA-Z]*) without checking policies$/, function(role) {
    const data = createDefaultFormInputData(role, undefined, {
      selectValues: ["paymentMethod"],
      checkboxValues: ["acceptPolicy"]
    });
    completeContactInformationForm(data, true, false);
  });


  this.When(/I finish selecting agreements for (.*)/, function(role) {
    const agreements = {
      acceptToc: true,
    };
    if (role === 'buyer') {
      agreements.acceptRisk = true;
    }
    completeAgreementsForm(agreements);
  });

  this.When(/I skip upload documents/, function() {
    waitAndClickButton(".wizard-submit-button.ui.button");
  });

  this.When(/^I check that I have not uploaded forbidden documents$/, function() {
    waitAndCheck("input[name=uploadWarning]");
  });

  this.When(/I don't complete contact-information/, function() {
    waitAndClickButton(".wizard-next-button.ui.button");
  });

  this.When(/I complete contact-information with negative Product/, function() {
    const information = createDefaultFormInputData(undefined, {
      productAmount: -1 * faker.finance.amount()
    }, { inputValues: [], selectValues: ["paymentMethod"] });
    completeContactInformationForm(information);
  });

  this.When(/I enter an productAmount of less than (.*) on the contact information screen/, function(amount) {
    const information = createDefaultFormInputData(undefined, {
      productAmount: amount - 1
    }, { inputValues: [], selectValues: ["paymentMethod"] });
    completeContactInformationForm(information);
  });

  this.When(/I skip agreements (.*)/, function(agreements) {
    agreements.split(',').forEach(function(strAgr) {
      const agr = strAgr.trim();
      waitAndUncheck(`input[name=${agr}]`);
    });
  });

  this.When(/^I complete contact\-information without zip code validation for (.*)$/, function(role) {
    const information = createDefaultFormInputData(role, {}, {
      checkboxValues: ["isZipCodeCorrect"],
      selectValues: ["paymentMethod"]
    });
    completeContactInformationForm(information);
  });

  this.When(/I click next/, function() {
    // We need to find a better way to do this
    try {
      clickNextButton();
    } catch (err) {
      clickNextButton();
    }
  });

  this.Then(/I should see a thank you message for enrolling as (.+)/, function(role) {
    const thankyouPanel = '.thank-you';
    client.waitForVisible(thankyouPanel);
    const thankyouMessage = waitAndGetText('#thank-you-message');
    const thankyouCode = (role === 'buyer') ? 'enrollThankYouInvoice' : 'enrollThankYouDistributor';
    let expected = i18nTest('messages.' + thankyouCode);
    expected = expected.replace(' <br /> <br /> ', '\n\n');
    expect(thankyouMessage).to.equal(expected);
  });

  this.Then(/I should see error messages regarding to missing contact information for (.*)/, function(role) {
    let errorMessages;
    if (role === 'distributor') {
      errorMessages = [
        'Last Name is required', 'First Name is required', 'Email Address is required',
        'Email Verification Code is required',
        'Phone Number is required', 'Birthdate is required', 'Zip Code is required',
        'State is required', 'City is required', 'Address is required',
        'I agree to the Privacy Policy is required'];
    } else {
      errorMessages = [
        'Last Name is required', 'First Name is required', 'Email Address is required',
        'Email Verification Code is required',
        'Phone Number is required', 'Birthdate is required', 'Zip Code is required',
        'State is required', 'City is required', 'Address is required',
        'Please enter the USD amount you wish to exchange into ' + productName() + ' is required',
        'I agree to the Privacy Policy is required'];
    }
    expectErrorMessages(errorMessages);
  });

  this.Then(/I should see an error message regarding to invalid Product amount/, function() {
    expectErrorMessages(['Please enter the USD amount you wish to exchange into ' + productName() + ' must be at least 1000']);
  });

  this.Then(/I should see error messages regarding for required agreements/, function() {
    expectErrorMessages(['I agree to the User Policy is required']);
  });

  this.Then(/I should see error messages regarding missing Privacy Policy/, function() {
    expectErrorMessages(['I agree to the Privacy Policy is required']);
  });

  this.Then(/I should see invalid ref code message/, function() {
    const errorClass = ".invalid-ref-code";
    client.waitForVisible(errorClass);
    expect(client.isVisible("select[name=language]")).to.equal(false);
  });

  this.Then(/I should see an error message for min Product Amount (.*)/, function(amount) {
    expectErrorMessages(['Please enter the USD amount you wish to exchange into ' + productName() + ' must be at least ' + amount]);
  });

  this.Then(/^I should see an error message regarding missing zip code validation$/, function() {
    const expectedErrors = [i18nTest('enroll.zipApiFail') + ' is required'];
    expectErrorMessages(expectedErrors);
  });

  this.Then(/^I should see an error message regarding missing document ID$/, function() {
    const expectedError = [i18nTest('enroll.idDocumentNumber') + ' is required'];
    expectErrorMessages(expectedError);
  });

  this.Then(/^I should receive the following emails: (.*)$/, function(emailCodes) {
    const expectedEmailCodes = emailCodes.replace(/ /g, '').split(',');
    const inputEmail = formValues.inputValues.email;
    const history = waitForEmails(expectedEmailCodes.length);
    for (let i = 0; i < expectedEmailCodes.length; i++) {
      const emails = _.filter(history, (email) => {
        return email.to === inputEmail && email.subject.indexOf('(Email Id: ' + expectedEmailCodes[i] + ')') > 0;
      });
      expect(emails.length).to.equal(1);
      const email = emails[0];
      if (expectedEmailCodes[i].indexOf('ET') > 0) {
        expect(email.text).to.contain("Ticket ID");
        expect(email.text).to.contain("USD Requested");
        expect(email.text).to.contain("Invoice Date");
      }
      expect(email.bcc).to.contain(process.env.COMPANY_BCC_EMAIL);
    }
  });

  this.Then(/^The email EU301 should be sent only to me$/, function() {
    const history = waitForEmails();
    expect(history.length).to.equal(1);
    const successEnrollEmail = history[0];
    expect(successEnrollEmail.to).to.equal(formValues.inputValues.email);
    expect(successEnrollEmail.subject).to.contain('(Email Id: EU301)');
    expect(successEnrollEmail.bcc).to.be.undefined;
  });

  this.Then(/^I(.*) see the state field on contact information step$/, function(not) {
    expect(client.isVisible("input[name=state]")).to.equal(not.length === 0);
  });

  const assertUserFieldValue = ( fieldPath, fieldValue) => {
    const inputEmail = formValues.inputValues.email;
    const storedUser = server.execute( (email) => {
      return Meteor.users.findOne( { "emails": { $elemMatch: { "address": { $eq: email } } } });
    }, inputEmail);
    const storedValue = _.get(storedUser, fieldPath);
    expect(storedValue).to.equal(fieldValue);
  };

  this.Then(/^I have State set as '(.+)'$/, function(value) {
    assertUserFieldValue('personalInformation.postaddress.state', value);
  });

  this.Then(/^I should see a checkbox asking me to confirm i'm not uploading forbidden documents$/, function() {
    client.waitForVisible("input[name=uploadWarning]");
  });

  this.Then(/^I should not see a checkbox asking me to confirm i'm not uploading forbidden documents$/, function() {
    client.waitForVisible("input[name=uploadWarning]", 5000, true);
  });

  this.Then(/I should see an error message stating I need to agree to not have uploaded MyNumber document/, function() {
    expectErrorMessages();
  });

  this.When(/I request email verification code/, function() {
    waitAndClickButton("#sendEmailVerificationCode");
  });

  this.When(/I confirm the email sent notification alert/, function() {
    // Get the email address that was used for the enrollment
    const email = waitAndGetValue("input[name=email]");
    // Fetch the i18 message from the server that we expect
    const errorMessage = i18nTest('enroll.emailVerificationCodeSent', email);
    expectAlertWithText(errorMessage);
    // Confirm the dialog and wait until it dissappears
    okModal();
  });

  this.When(/I complete contact information with the new code/, function() {
    const completedEmail = waitAndGetValue("input[name=email]");
    const emailVerificationRefCode = server.execute((email) => {
      return Refs.findOne({ reftype: 'emailVerification', emailto: email, isActive: true });
    }, completedEmail);
    waitAndSetValue("input[name=emailVerificationCode]", emailVerificationRefCode.refcode);
  });

  this.When(/I complete contact information with an invalid email verification code/, function() {
    waitAndSetValue("input[name=emailVerificationCode]", 'INVALID_CODE');
  });

  this.When(/^I complete residence selection with Vietnam as country of residence, without agreed that documents are in English$/, function() {
    completeResidenceSelectionForm({
      language: "en",
      residenceCountry: "VN",
    });
  });

  this.Then(/^I should see an alert about the invalid email verification code$/, function() {
    // Fetch the i18n message from the server that we expect
    const errorMessage = i18nTest('enroll.errors.email-verification-invalid-code');
    expectAlertWithText(errorMessage);
  });

  this.Then(/^I should see an error message regarding missing agreement$/, function() {
    expectErrorMessages();
  });
};
