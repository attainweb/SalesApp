import { waitAndSelect } from '/test/end-to-end/tests/_support/webdriver';
import { getUserFromDB } from '/test/end-to-end/tests/_support/accounts';

const REFTYPE_URL_MAP = {
  buyer: 'enroll/',
  distributor: 'enroll/',
  confirmAddress: 'confirm-address-change/',
  confirmEmailAccount: 'confirm-email-account/',
  confirmEmailChange: 'confirm-email-change/',
  're-generate-all': 're-generate-all-product-passcodes/'
};

const REFTYPE_SCREEN_SUCCESS_CLASS = {
  buyer: '.enroll',
  distributor: '.enroll',
  confirmAddress: '.confirm-change-success',
  confirmEmailAccount: '.confirm-change-success',
  confirmEmailChange: '.confirm-change-success',
  're-generate-all': 'success'
};

module.exports = function() {

  this.When(/^I add the status underInvestigation$/, function() {
    waitAndSelect(`select[name='personalInformation.isUnderInvestigation']`, "true");
  });

  this.When(/^I remove the status underInvestigation$/, function() {
    waitAndSelect(`select[name='personalInformation.isUnderInvestigation']`, "false");
  });

  this.Then(/^I should see that the user\'s under investigation status has changed$/, function() {
    const updatedUser = getUserFromDB(this.accounts.getUser(this.reviewUserEmail)[0]._id);
    expect(this.userBeforeSaving.personalInformation.isUnderInvestigation).to.not.equal(updatedUser.personalInformation.isUnderInvestigation);
  });

  this.Then(/^I should (.*)be able to go to (.*) links$/, function(not, userCode) {
    const user = this.accounts.getUserByKey(userCode);
    const partialRefs = this.refs.getRefcodesByOriginatorId(user.id);
    const refs = partialRefs.concat(this.refs.getRefcodesByUserId(user.id));
    expect(refs.length).to.be.above(0);
    refs.forEach((ref) => {
      this.router.visit(REFTYPE_URL_MAP[ref.reftype] + ref.refcode, ()=> {
        if (not) {
          expect(client.isExisting('.invalid-ref-code')).to.be.true;
        } else {
          expect(client.isExisting(REFTYPE_SCREEN_SUCCESS_CLASS[ref.reftype])).to.be.true;
        }
      });
    });
  });
};
