import { emailToFuzzySearchTerm } from '/imports/lib/shared/fuzzy-email-search';


const EmailObject = new SimpleSchema({
  address: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  verified: {
    type: Boolean,
    autoValue: function() { return true; }, // don't require email verification
  },
});

Schemas.EmailObject = EmailObject;

const StringRecord = new SimpleSchema({
  value: {
    type: String,
    optional: true,
  },
  changedAt: {
    type: Date,
    autoValue: function() { if (!this.isSet) return new Date(); else return undefined; },
  },
  changedBy: {
    type: String,
    optional: true,
    autoValue: function() { if (!this.isSet) return this.userId; else return undefined; },
  },
});

const GeneralNotesSchema = new SimpleSchema({
  name: {
    type: String
  },
  userId: {
    type: String
  },
  role: {
    type: String
  },
  type: {
    type: String,
    allowedValues: ['webCheck', 'call', 'customerServiceNote'] 
  },
  comment: {
    type: String,
    min: 1,
    max: 256
  },
  createdAt: {
    type: Date,
    autoValue: function() { if (!this.isSet) return new Date(); else return undefined; },
  },

});

const Postaddress = new SimpleSchema({
  address: {
    type: String,
    optional: true,
  },
  city: {
    type: String,
    optional: true,
  },
  state: {
    type: String,
    optional: true,
  },
  zip: {
    type: String,
    optional: true,
  },
  nationality: {
    type: String,
    optional: true,
  },
  apiInvalidZip: {
    type: Boolean,
    optional: true,
    autoValue: function() {
      if (this.isSet && this.value !== true) {
        return false;
      }
      return undefined;
    }
  }
});

const PolicyAgreementDates = new SimpleSchema({
  PRIVACY: {
    type: [Date],
    defaultValue: []
  },
  TOC: {
    type: [Date],
    defaultValue: []
  },
  RISK: {
    type: [Date],
    defaultValue: []
  },
});

const FuzzySearchEmail = new SimpleSchema({
  normalized: {
    type: String,
    optional: false
  },
  alias: {
    type: String,
    optional: true
  }
});

const UserPersonalInformation = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  surname: {
    type: String,
    optional: true,
  },
  companyName: {
    type: String,
    optional: true,
  },
  registrationDate: {
    type: Date,
    optional: true,
  },
  phone: {
    type: String,
    optional: true,
  },
  postaddress: {
    type: Postaddress,
    optional: true,
  },
  birthdate: {
    type: Date,
    optional: true,
  },
  refcode: {
    type: String,
    optional: true,
  },
  status: {
    type: String,
    allowedValues: ['PENDING', 'APPROVED', 'REJECTED'],
    optional: true,
  },
  language: {
    type: String,
    defaultValue: 'ja',
  },
  residenceCountry: {
    type: String,
    optional: true, // This should not be optional - As soon as it is in production and set, we should change it to optional: false
  },
  accountType: {
    type: String,
    allowedValues: ['personal', 'company'],
    optional: true,
  },
  agreedToPolicyAt: {
    type: PolicyAgreementDates,
  },
  originatorId: {
    type: String,
    optional: true,
  },
  oldOriginatorIds: {
    type: [StringRecord],
    optional: true,
  },
  distlevel: {
    type: Number,
    optional: true,
  },
  hasInvoiceWallet: {
    type: Boolean,
    optional: true
  },
  invoiceWalletId: {
    type: String,
    optional: true
  },
  walletAddress: {
    type: String,
    optional: true,
  },
  oldWalletAddresses: {
    type: [StringRecord],
    optional: true,
  },
  hasBeenReviewed: {
    type: Boolean,
    defaultValue: false
  },

  complianceLevel: {
    type: Number,
    allowedValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    defaultValue: 0,
    optional: true,
  },
  applyingForComplianceLevel: {
    type: Number,
    allowedValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    optional: true,
  },

  // These are old fields that are there for schema compatibility reasons
  // They should not be used any more !!!
  agreedToTOC: {
    type: Boolean,
    optional: true,
    autoValue: function(doc) {
      obsolteSchemaFieldError(this, doc, 'agreedToTOC');
    },
  },
  agreedToTocAt: {
    type: Date,
    optional: true,
    autoValue: function(doc) {
      obsolteSchemaFieldError(this, doc, 'agreedToTocAt');
    },
  },
  enteredComplianceAt: {
    type: Date,
    optional: true,
    autoValue: function() {
      const content = this.siblingField("status");
      if (content.isSet && content.value === 'PENDING') {
        return new Date();
      }
      return undefined;
    },
  },
  requiresResidenceDoc: {
    type: Boolean,
    optional: true,
    autoValue: function(doc) {
      obsolteSchemaFieldError(this, doc, 'requiresResidenceDoc');
    },
  },
  purchaseUnits: {
    type: Number,
    optional: true,
    autoValue: function(doc) {
      obsolteSchemaFieldError(this, doc, 'purchaseUnits');
    },
  },
  receivedSatoshisPreComplianceCheck: {
    type: Boolean,
    defaultValue: false,
  },
  watchedBy: {
    type: [String],
    defaultValue: [],
  },
  delegatedToCco: {
    type: Boolean,
    defaultValue: false,
  },
  isUnderInvestigation: {
    type: Boolean,
    defaultValue: false,
  },
  delegatedToHco: {
    type: Boolean,
    defaultValue: false,
  },
  oldDelegatedToCco: {
    type: [StringRecord],
    optional: true,
    autoValue: function() {
      const content = this.siblingField("delegatedToCco");
      if (content.isSet && content.value) {
        if (this.isInsert) {
          return [{
            value: this.userId,
            changedAt: new Date(),
          }];
        } else {
          return {
            $push: {
              value: this.userId,
              changedAt: new Date(),
            }
          };
        }
      }
      return undefined;
    }
  },
  enrollmentClientIP: {
    type: String,
    optional: true,
  },
  agreedToDocumentsInEnglishAt: {
    type: Date,
    optional: true, // the field is only for users with residenceCountry Vietnam(VN)
    autoValue: function() {
      if (this.isUpdate || this.isInsert || this.isUpsert) {
        const content = this.siblingField('residenceCountry');
        if (content && content.isSet) {
          if (content.value === 'VN') {
            return new Date();
          }
          return this.unset();
        }
      }
    }
  }
});

obsolteSchemaFieldError = function(self, doc, name) {
  if (!_.isEmpty(self.operator) && self.isSet) {
    console.error("UserPersonalInformation", name, "obsolete field - should not be used any more!!!", self.docId, doc);
  }
};

const getKeys = function(basekey, items) {
  return items.map((i)=> {return basekey + '.' + i; } );
};

// Changelog watched fields
// Please add fields here that you want to the changelog to watch and add to it's collection when they are modified
// You can use a * to watch for all child properties
const keepChangelogOf = [
  'personalInformation.name', 'personalInformation.surname', 'personalInformation.companyName', 'personalInformation.birthdate', 'personalInformation.phone',
  'personalInformation.status', 'personalInformation.language', 'personalInformation.residenceCountry',
  ...getKeys('personalInformation.postaddress', Postaddress.objectKeys()),
  'emails.0.address',
];

Schemas.User = new SimpleSchema([Schemas.Basic, {
  emails: {
    type: [EmailObject],
  },
  oldEmails: {
    type: [StringRecord],
    defaultValue: [],
    optional: true,
  },
  fuzzySearchEmails: {
    type: [FuzzySearchEmail],
    autoValue: function() {
      if (!this.isSet) {
        const emails = this.field('emails');
        if (emails.isSet) return emails.value.map(email => {
          return emailToFuzzySearchTerm(email.address);
        });
        const address = this.field('emails.0.address');
        if (address.isSet) return [emailToFuzzySearchTerm(address.value)];
      }
      return undefined;
    }
  },
  personalInformation: {
    type: UserPersonalInformation,
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  roles: {
    type: [String],
  },
  reviewing: {
    type: String,
    optional: true,
  },
  notes: {
    type: [GeneralNotesSchema],
    defaultValue: [],
    optional: true
  },
  comment: {
    type: String,
    optional: true,
  },
  changelog: {
    type: [Object],
    blackbox: true,
    autoValue: function() {
      let changes = keepChangelogOf.map( (fieldName) => {
        const curField = this.field(fieldName);
        if (curField.isSet) {
          return {
            field: fieldName,
            changedAt: new Date(),
            value: curField.value,
            changedBy: this.userId, // this is used instead of Meteor.user() since it cannot be used amongst publications
          };
        }
        return undefined;
      }).filter((i) => !(typeof i === 'undefined' || typeof i === null) );

      if (this.isInsert) {
        return changes;
      } else {
        return {
          $push: {$each: changes}
        };
      }
    }
  },
  blacklisted: {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  uncontactable: {
    type: Boolean,
    optional: true
  },
  duplicateOf: {
    type: String,
    optional: true
  },
  isTestUser: {
    type: Boolean,
    optional: true,
  },
  possibleDuplicateOf: {
    type: [String],
    optional: true,
  },
}]);

Meteor.users.attachSchema(Schemas.User);
