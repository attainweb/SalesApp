if (Meteor.isServer) {
  Logger = require('/imports/server/lib/logger').default;
}

DEFAULT_REFCODE_LENGTH = 20;

const generateRefcode = function generateRefcode(length = DEFAULT_REFCODE_LENGTH) {
  return CryptoJS.MD5('' + Math.random()).toString().substr(0, length);
};

export const genRefcode = function(length = DEFAULT_REFCODE_LENGTH) {
  return 'r' + generateRefcode(length);
};

export const genSignref = function() {
  return 's' + CryptoJS.MD5('' + Math.random()).toString();
};

export const checkRef = function(refcode) {
  const ref = Refs.findOne({ refcode: refcode });
  if (!ref) return false; // if not found, invalidate

  return ref.isValid();
};

export const retireRef = function(refcode) {
  return Refs.update({
    refcode: refcode
  }, {
    $set: {
      isActive: false
    }
  });
};

export const allowedToRetireRef = function(refcode) {
  const allowance = {
    'admin': ['partner'],
    'distributor': ['buyer', 'distributor', 'confirmAddress'],
  };
  const ref = Refs.findOne({ refcode: refcode });
  for (role in allowance) {
    if (Roles.userIsInRole(this.userId, role)
     && _.contains(allowance[role], ref.reftype())) {
      return true;
    }
  }
  return false;
};

export const checkEmailVerificationRef = function(refcode, email) {
  const ref = Refs.findOne({ refcode: refcode, reftype: 'emailVerification', emailto: email, isActive: true });
  return ref ? ref : false;
};

export const Ref = function(options = {}) {
  this.clicked = 0;
  this.reftype = options.reftype;
  this.refcode = options.refcode;

  if (!_.contains(['signup', 'reset', 'emailVerification'], this.reftype)) {
    this.timetype = options.timetype;
    this.name = options.name;
    this.notes = options.notes;
    if (!this.refcode) this.refcode = genRefcode();
  }

  // TODO: Refactor this!!
  switch (this.reftype) {
    case 'partner':
      this.distlevel = 0;
      this.timetype = 'onetime';
      break;
    case 'distributor':
      this.distlevel = options.distlevel;
      break;
    case 'signup':
    case 'reset':
      this.emailto = options.emailto;
      if (!this.refcode) this.refcode = genSignref();
      break;
    case 'confirmAddress':
      this.userId = options.userId;
      this.address = options.address;
      if (!this.refcode) this.refcode = genSignref();
      break;
    case 'confirmEmailAccount':
    case 'confirmEmailChange':
      this.userId = options.userId;
      this.emailAddress = options.emailAddress;
      if (!this.refcode) this.refcode = genSignref();
      break;
    case 'buyer': break;
    case 're-generate-all':
      this.userId = options.userId;
      this.emailto = options.emailto;
      if (!this.refcode) this.refcode = genSignref();
      break;
    case 're-generate-one':
      this.userId = options.userId;
      this.emailto = options.emailto;
      this.invoiceTicketId = options.invoiceTicketId;
      if (!this.refcode) this.refcode = genSignref();
      break;
    case 'emailVerification':
      this.emailto = options.emailto;
      this.timetype = 'onetime';
      if (!this.refcode) this.refcode = generateRefcode();
      break;
    default: Logger.info('[Error] new Ref: Unknown reftype "' + this.reftype + '"');
  }

  this.originatorId = options.originatorId;
  this.createdAt = options.createdAt || new Date();
  if (options.isActive === undefined || options.isActive === null) {
    this.isActive = true;
  } else {
    this.isActive = options.isActive;
  }

};
