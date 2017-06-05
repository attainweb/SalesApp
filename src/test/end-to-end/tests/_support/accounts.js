import UserBuilder from '/imports/lib/fixtures/user-builder.js';
import _ from 'lodash';

const getBuyer = function getBuyer() {
  return new UserBuilder()
      .withRole('buyer')
      .withoutDistlevel()
      .withoutInvoiceWalletId()
      .withoutWalletAddress();
};

// Helpers
const prebuiltUsers = {
  admin: new UserBuilder()
    .withEmail('test-email+admin1@company.com')
    .withPassword('Aasdf1234')
    .withStatus('APPROVED')
    .withRole('admin')
    .withComplianceLevel(2)
    .withAccountType('personal')
    .build(),

  approvedBuyer: function() {
    const distributor = this.accounts.getUserByKey('approvedDistributor');
    return getBuyer()
      .withEmail('approved@company.com')
      .withPassword('Aasdf1234')
      .withStatus('APPROVED')
      .withComplianceLevel(2)
      .withAccountType('personal')
      .withOriginatorId(distributor._id)
      .build();
  },
  productStorageBuyer: function() { // Used to fill up the Product counter
    const distributor = this.accounts.getUserByKey('approvedDistributor');
    return getBuyer()
      .withEmail('productStorageBuyer@company.com')
      .withPassword('Aasdf1234')
      .withStatus('APPROVED')
      .withRole('buyer')
      .withComplianceLevel(2)
      .withAccountType('personal')
      .withOriginatorId(distributor._id)
      .build();
  },
  approvedBuyerWithHighestComplianceLevel: function() {
    const distributor = this.accounts.getUserByKey('approvedDistributor');
    return getBuyer()
      .withEmail('approvedBuyerWithHighestComplianceLevel@company.com')
      .withPassword('Aasdf1234')
      .withStatus('APPROVED')
      .withRole('buyer')
      .withComplianceLevel(4)
      .withAccountType('personal')
      .withOriginatorId(distributor._id)
      .build();
  },
  pendingBuyerWithHighestComplianceLevel: function() {
    const distributor = this.accounts.getUserByKey('approvedDistributor');
    return getBuyer()
        .withEmail('pendingBuyerWithHighestComplianceLevel@company.com')
        .withPassword('Aasdf1234')
        .withStatus('PENDING')
        .withRole('buyer')
        .withComplianceLevel(4)
        .withAccountType('personal')
        .withOriginatorId(distributor._id)
        .build();
  },

  notApprovedBuyer: function() {
    return getBuyer()
    .withEmail('notApproved@company.com')
    .withStatus('PENDING')
    .withRole('buyer')
    .withComplianceLevel(2)
    .withApplyingForComplianceLevel(2)
    .withAccountType('personal')
    .build();
  },

  approvedDistributor: new UserBuilder()
    .withEmail('approved-distributor@company.com')
    .withStatus('APPROVED')
    .withRole('distributor')
    .withDistlevel(2)
    .withAccountType('personal')
    .build(),

  approvedDistributor2: new UserBuilder()
    .withEmail('approved-distributor2@company.com')
    .withStatus('APPROVED')
    .withRole('distributor')
    .withDistlevel(1)
    .withAccountType('personal')
    .build(),


  approvedPartner: new UserBuilder()
    .withEmail('approved-partner@company.com')
    .withStatus('APPROVED')
    .withRole('distributor')
    .withDistlevel(0)
    .withAccountType('personal')
    .build(),

  notApprovedPartner: new UserBuilder()
    .withEmail('notApproved-partner@company.com')
    .withStatus('APPROVED')
    .withRole('distributor')
    .withDistlevel(0)
    .withAccountType('personal')
    .build(),

  notApprovedDistributor: new UserBuilder()
    .withEmail('notApproved-distributor@company.com')
    .withStatus('PENDING')
    .withRole('distributor')
    .withDistlevel(2)
    .withAccountType('personal')
    .build(),

  headInvoiceManager: new UserBuilder()
    .withPassword('Aasdf1234')
    .withEmail('headInvoiceManager@company.com')
    .withRole('headInvoiceManager')
    .withStatus('APPROVED')
    .build(),

  bankManager: new UserBuilder()
    .withPassword('Aasdf1234')
    .withEmail('bankManager@company.com')
    .withRole('bankManager')
    .withStatus('APPROVED')
    .build(),

  bankChecker: new UserBuilder()
    .withPassword('Aasdf1234')
    .withEmail('bankChecker@company.com')
    .withRole('bankChecker')
    .withStatus('APPROVED')
    .build(),

  exporter: new UserBuilder()
    .withPassword('Aasdf1234')
    .withEmail('exporter@company.com')
    .withRole('exporter')
    .withStatus('APPROVED')
    .build(),

  customerService: new UserBuilder()
    .withPassword('Aasdf1234')
    .withEmail('customerService@company.com')
    .withRole('customerService')
    .withStatus('APPROVED')
    .build(),

  investigator: new UserBuilder()
    .withPassword('Aasdf1234')
    .withEmail('investigator@company.com')
    .withRole('investigator')
    .withStatus('APPROVED')
    .build(),

  compliance: new UserBuilder()
    .withPassword('Aasdf1234')
    .withEmail('compliance@company.com')
    .withRole('compliance')
    .withStatus('APPROVED')
    .build(),

  chiefcompliance: new UserBuilder()
    .withPassword('Aasdf1234')
    .withEmail('chiefcompliance@company.com')
    .withStatus('APPROVED')
    .withRole('chiefcompliance')
    .build(),

  headCompliance: new UserBuilder()
    .withPassword('Aasdf1234')
    .withEmail('headCompliance@company.com')
    .withStatus('APPROVED')
    .withRole('headCompliance')
    .build(),

  approvedBuyerSentToHco: function() {
    return getBuyer()
    .withEmail('approvedBuyerSentToHco@company.com')
    .withStatus('APPROVED')
    .withRole('buyer')
    .withComplianceLevel(2)
    .withApplyingForComplianceLevel(2)
    .withAccountType('personal')
    .withDelegatedToHco(true)
    .build();
  },

  notApprovedBuyerSentToHco: function() {
    return getBuyer()
    .withEmail('notApprovedBuyerSentToHco@company.com')
    .withStatus('PENDING')
    .withRole('buyer')
    .withComplianceLevel(2)
    .withApplyingForComplianceLevel(2)
    .withAccountType('personal')
    .withDelegatedToHco(true)
    .build();
  },

  distributorSentToHco: new UserBuilder()
    .withEmail('distributorSentToHco@company.com')
    .withRole('distributor')
    .withStatus('APPROVED')
    .withDistlevel(1)
    .withAccountType('personal')
    .withDelegatedToHco(true)
    .build(),

  distributorUnderInvestigation: new UserBuilder()
    .withEmail('distributorUnderInvestigation@company.com')
    .withRole('distributor')
    .withStatus('APPROVED')
    .withDistlevel(1)
    .withAccountType('personal')
    .withDelegatedToHco(true)
    .withIsUnderInvestigation(true)
    .build(),

  notApprovedBuyerSentToCco: function() {
    return getBuyer()
    .withEmail('notApprovedBuyerSentToCco@company.com')
    .withStatus('PENDING')
    .withRole('buyer')
    .withComplianceLevel(2)
    .withApplyingForComplianceLevel(2)
    .withAccountType('personal')
    .withDelegatedToCco(true)
    .build();
  },

  sysop: new UserBuilder()
    .withEmail('test-email+sysop@company.com')
    .withPassword('Aasdf1234')
    .withStatus('APPROVED')
    .withRole('sysop')
    .withAccountType('personal')
    .build()

};

const createUser = function(user) {
  const id = Accounts.createUser(user);
  user.id = id;
  user._id = id;

  Meteor.users.update(id, {
    $set: {
      roles: user.roles,
      oldEmails: [null]
    }
  });

  return user;
};

module.exports = function() {

  this.Before(function() {
    // ======= Helper API =======
    this.accounts = {
      getUser: (email) => {
        return Object.values(this.fixtures.users).filter((user) => user.email === email);
      },
      getUserByKey: (key, originatorKey) => {
        let user = this.fixtures.users[key];
        let originator = this.fixtures.users[originatorKey];

        if (originatorKey !== undefined && originator === undefined) {
          throw new Error(`Could not find user with key '${originatorKey}'`);
        }

        // User is not yet created
        if (!user) {
          if (!prebuiltUsers[key]) {
            throw new Error(`Could not get or create user with key '${key}'`);
          }
          const prebuiltUser = _.isFunction(prebuiltUsers[key]) ? prebuiltUsers[key].bind(this)() : prebuiltUsers[key];

          // If the user has an originator
          if (originatorKey !== undefined) prebuiltUser.personalInformation.originatorId = originator._id;

          user = this.fixtures.users[key] = server.execute(createUser, prebuiltUser);
        }

        return user;
      },
      getAdmin: () => {
        return this.accounts.getUserByKey('admin');
      },
      login(user) {
        client
          .timeoutsAsyncScript(60000)
          .executeAsync((data, done) => {
            Meteor.logout((logoutError) => {
              if (logoutError) throw logoutError;
              Meteor.loginWithPassword(data.email, data.password, (loginError) => {
                if (loginError) throw loginError;
                done();
              });
            });
          }, user);
        // Wait for login screen to dissapear
        client.waitForExist("#login", 50000, true);
      },
      logout() {
        client
          .timeoutsAsyncScript(20000)
          .executeAsync((done) => {
            Meteor.logout((logoutError) => {
              if (logoutError) throw logoutError;
              done();
            });
          });
      },
      stubLoggedInMeteorUser(user) {
        server.execute((currentUserId) => {
          Meteor.userBackup = Meteor.user;
          Meteor.user = () => Meteor.users.findOne(currentUserId);
        }, user._id);
      },
      restoreLoggedInMeteorUserStub() {
        server.execute(() => {
          Meteor.user = Meteor.userBackup;
        });
      }
    };
  });

  this.Given(/^I am the (.+)$/, function(user) {
    this.user = this.accounts.getUserByKey(user);
    this.accounts.stubLoggedInMeteorUser(this.user);
  });
  this.Given(/^there is an user with role (.+) created$/, function(user) {
    this.accounts.getUserByKey(user);
  });
  this.Given(/^there is an user with role (.+) created with (.+) as originator/, function(user, originator) {
    this.accounts.getUserByKey(user, originator);
  });
  this.Given(/^I am unKnow user with email: (.+)$/, function(unknowUserEmail) {
    this.userEmail = unknowUserEmail;
  });

};

module.exports.createUser = createUser;

module.exports.getUserFromDB = function(userId, returnFields = {}) {
  return server.execute( (id, fields) => {
    return Meteor.users.findOne(id, { fields: fields});
  }, userId, returnFields);
};

module.exports.updateUserField = function(userId, updatedField, newValue) {
  return server.execute( (id, field, value) => {
    const update = { '$set': {} };
    update.$set[`${field}`] = value;
    return Meteor.users.update(id, update);
  }, userId, updatedField, newValue);
};

module.exports.createMultipleUsers = function(numberOfUsers, userTemplateFunction) {
  if (!this.currentTestUsers) this.currentTestUsers = [];
  for (let i = 0; i < numberOfUsers; i++) {
    const newUser = userTemplateFunction.bind(this)();
    this.currentTestUsers.push(server.execute(createUser, newUser));
  }
};
