'use strict';

import faker from "faker";

export default class RefsBuilder {

  constructor(reftype) {
    const email = faker.internet.email();
    this.refs = {
      refcode: faker.random.alphaNumeric(),
      reftype: reftype,
      emailto: email,
      emailAddress: email,
      isActive: true,
      originatorId: undefined,
      userId: undefined,
      createdAt: new Date()
    };

    // This creates default withXXXX method for personalInformation object. This must be overriden in case of complex assignments
    // No lodash is used because we needed to add dev dependency just for this and we think it's not worthy right now
    Object.keys(this.refs).forEach( personalInformationAttr => {
      this['with' + personalInformationAttr.charAt(0).toUpperCase() + personalInformationAttr.slice(1)] = value => {
        this.refs[personalInformationAttr] = value;
        return this;
      };
    });
  }

  build() {
    return this.refs;
  }
}
