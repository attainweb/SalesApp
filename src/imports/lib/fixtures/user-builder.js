'use strict';

import faker from "faker";
import _ from 'lodash';

export default class UserBuilder {

  constructor() {
    const address = faker.internet.email();

    this.user = {
      emails: [{
        address: address,
        verified: true
      }],
      email: address,
      password: "Aasdf1234", // Hardcoded password in order to manually test when cucumber fails
      personalInformation: {
        name: faker.name.firstName(),
        surname: faker.name.lastName(),
        companyName: faker.company.companyName(),
        registrationDate: faker.date.past(),
        phone: faker.phone.phoneNumber(),
        status: faker.random.arrayElement(["PENDING", "APPROVED", "REJECTED"]),
        accountType: faker.random.arrayElement(["personal", "company"]),
        birthdate: faker.date.past(),
        refcode: faker.random.number({
          min: 5,
          max: 8
        }),
        agreedToPolicyAt: {
          PRIVACY: [new Date()],
          TOC: [new Date()],
          RISK: [new Date()]
        },
        hasInvoiceWallet: true,
        delegatedToHco: false,
        delegatedToCco: false,
        isUnderInvestigation: false,
        invoiceWalletId: faker.finance.bitcoinAddress(),
        walletAddress: faker.finance.bitcoinAddress(),
        complianceLevel: faker.random.arrayElement([0, 1, 2, 3, 4]),
        distlevel: faker.random.arrayElement([0, 1, 2, 3]),
        applyingForComplianceLevel: faker.random.arrayElement([1, 2, 3, 4]),
        agreedToTOC: true,
        postaddress: {
          address: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.state(),
          zip: faker.address.zipCode()
        },
        residenceCountry: 'JP',
        language: 'en'
      }
    };

    // This creates default withXXXX method for personalInformation object. This must be overriden in case of complex assignments
    // No lodash is used because we needed to add dev dependency just for this and we think it's not worthy right now
    Object.keys(this.user.personalInformation).forEach( personalInformationAttr => {
      const withAccesorName = _.camelCase(`with ${personalInformationAttr}`);
      this[withAccesorName] = _.isFunction(this[withAccesorName]) ? this[withAccesorName] : value => {
        this.user.personalInformation[personalInformationAttr] = value;
        return this;
      };
      const withoutAccesorName = _.camelCase(`without ${personalInformationAttr}`);
      this[withoutAccesorName] = _.isFunction(this[withoutAccesorName]) ? this[withoutAccesorName] : () => {
        delete this.user.personalInformation[personalInformationAttr];
        return this;
      };
    });
  }

  withEmail(email) {
    this.user.email = email;
    this.user.emails = [{
      email,
      approved: true
    }];
    return this;
  }

  withRole(role) {
    this.user.roles = [];
    this.user.roles.push(role);
    return this;
  }

  withPassword(password) {
    this.user.password = password;
    return this;
  }

  withDistlevel(distlevel) {
    this.user.personalInformation.distlevel = distlevel;
    return this;
  }

  withOriginatorId(id) {
    this.user.personalInformation.originatorId = id;
    return this;
  }

  build() {
    return this.user;
  }
}
