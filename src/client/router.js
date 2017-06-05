Router.permittedRoutes = [
  'landing',
  'login',
  'passwordReset',
  'dref',
  'bref',
  'signup',
  'notFound',
  'reorder',
  'reorderThankYou',
  'enrollWizard',
  'enrollThankYou',
  'enrollThankYouInvoice',
  'enrollThankYouDistributor',
  'payBtc',
  'pay',
  'addressChange',
  'reGenerateAllProductPasscodes',
  'reGenerateProductPasscode',
  'confirmEmailAccount',
  'confirmEmailChange'
];

const mustBeSignedIn = function() {
  const user = Meteor.user();

  if (!(user || Meteor.loggingIn())) {
    this.redirect('login');
    // TODO: show error
    // throw Meteor.Error(403, "Not authorized");
  } else {
    const roleRouteMap = {
      admin: [
        'addComplianceOfficer',
        'addCustomerServiceOfficer',
        'viewpartnerlinks',
        'partnerlink',
        'complianceRecords',
        'buyers',
        'commissions',
        'sale-overview',
      ],
      customerService: ['customerService', 'reviewUser'],
      investigator: ['investigator', 'reviewUser'],
      compliance: ['queue', 'reviewUser', 'complianceRecords'],
      chiefcompliance: ['queue', 'reviewUser', 'complianceRecords'],
      headCompliance: ['queue', 'reviewUser'],
      // possible refactor: generate a group role? - refactor primaryRole() method
      headInvoiceManager: ['invoice_queue'],
      bankManager: ['invoice_queue'],
      bankChecker: ['invoice_queue'],
      exporter: ['invoice_queue'],
      distributor: [
        'account',
        'distref',
        'buyerref',
        'viewlinks',
        'buyers',
        'commissions'
      ],
      buyer: ['account', 'accountreorder', 'purchases'],
      sysop: ['sale-overview', 'jobs-monitor']
    };

    const role = user.primaryRole();
    const roleRoutes = roleRouteMap[role];
    const permittedRoutes = Router.permittedRoutes.concat(roleRoutes);
    const routeName = this.options.route.getName();
    const sidebarTemplate = role + 'Sidebar';

    // Only use the dashboard layout for backend-routes of user's role
    // For routes that can be public use the default layout
    if (_.contains(roleRoutes, routeName)) {
      this.layout('layout');
      this.render(sidebarTemplate, {to: 'sidebar'});
    }

    // console.log("authenticate", 'User must accept policies first', user.mustAgreeToPolicies());
    if (role === 'distributor') {
      try {
        if (user.mustAgreeToPolicies()) {
          console.log("authenticate", 'User must accept policies first');
          this.render('policyApproval');
          return;
        }
      } catch (err) {
        this.render('regionalError');
        return;
      }
    }
    if (!_.contains(permittedRoutes, routeName)) this.render('unauthorized');
    this.next();
  }
};

const validateRoutes = function(router, condition, okCallback) {
  if (condition) {
    okCallback();
  } else {
    console.log('User is not authorized to access this route');
    router.render('unauthorized');
  }
};

const mustBeApprovedDistributor = function(router, okCallback) {
  const mustBeApprovedDistributorCondition = Meteor.user().isDistributor() && Meteor.user().isApproved();
  validateRoutes(router, mustBeApprovedDistributorCondition, okCallback);
};

const updateLangBasedOnQueryString = function(router, i18n) {
  const lang = router.params.query.lang;
  if (typeof lang !== undefined) {
    i18n.setLanguage(lang);
  }
};

const beforeRefPage = function() {
  if (this.params && this.params.query && this.params.query.lang) {
    updateLangBasedOnQueryString(this, i18n);
  }
  const next = this.next;
  Meteor.call('checkRef', this.params.refcode, function(err, res) {
    Session.set('srefvalid', res);
    next();
  });
};

// Must be signed in to visit any route, except the following
Router.onBeforeAction(mustBeSignedIn, {except: Router.permittedRoutes});

Router.configure({
  loadingTemplate: 'loading',
  layoutTemplate: 'withoutUserLayout',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Roles.subscription, Meteor.subscribe('currentUser'), Meteor.subscribe('linkrefs')];
  },
});

Wizard.useRouter('iron:router');

Router.map(function() {

  this.route('landing', {
    path: '/',
    before: function() {
      const user = Meteor.user();
      if (user) {
        const defaultPageMap = {
          admin: 'sale-overview',
          customerService: 'customerService',
          investigator: 'investigator',
          compliance: 'queue',
          chiefcompliance: 'queue',
          headCompliance: 'queue',
          headInvoiceManager: 'invoice_queue',
          bankManager: 'invoice_queue',
          bankChecker: 'invoice_queue',
          exporter: 'invoice_queue',
          distributor: 'account',
          buyer: 'account',
          sysop: 'sale-overview'
        };
        const role = user.primaryRole();
        const defaultRoute = defaultPageMap[role];
        this.redirect(defaultRoute);
      } else {
        this.next();
      }
    }
  });

  this.route('login', {
    path: '/login',
    before: function() {
      // Redirect to landing page in any case
      this.redirect('/');
    }
  });

  this.route('passwordReset', {
    path: '/password-reset/:refcode',
    layoutTemplate: 'withoutUserLayout',
    template: 'createPassword',
    data: function() {
      return {
        action: 'reset',
        title: i18n('createPassword.reset'),
        invalid: i18n('createPassword.invalidReset'),
        button: i18n('createPassword.buttonReset'),
        refcode: this.params.refcode
      };
    },
    before: beforeRefPage
  });

  this.route('addressChange', {
    path: '/confirm-address-change/:refcode',
    layoutTemplate: 'withoutUserLayout',
    template: 'confirmChange',
    data: function() {
      return {
        confirmMeteorCall: 'confirmWalletAddressUpdate',
        namespace: 'confirmWalletChange',
        refcode: this.params.refcode
      };
    },
    before: function() {
      updateLangBasedOnQueryString(this, i18n);
      this.next();
    }
  });

  const getChangeEmailSteps = function() {
    return [
      {labelCode: "changeEmail.stepsLabels.enterEmail", status: 'complete'},
      {labelCode: "changeEmail.stepsLabels.confirmNewEmail", status: 'disabled'},
      {labelCode: "changeEmail.stepsLabels.confirmOldEmail", status: 'disabled'}
    ];
  };

  this.route('confirmEmailAccount', {
    path: '/confirm-email-account/:refcode',
    layoutTemplate: 'withoutUserLayout',
    template: 'confirmChange',
    data: function() {
      const steps = getChangeEmailSteps();
      steps[1].status = 'active';
      return {
        confirmMeteorCall: 'confirmEmailAccount',
        namespace: 'confirmEmailAccount',
        progressSteps: steps,
        refcode: this.params.refcode
      };
    },
    before: function() {
      updateLangBasedOnQueryString(this, i18n);
      this.next();
    }
  });

  this.route('confirmEmailChange', {
    path: '/confirm-email-change/:refcode',
    layoutTemplate: 'withoutUserLayout',
    template: 'confirmChange',
    data: function() {
      const steps = getChangeEmailSteps();
      steps[1].status = 'complete';
      steps[2].status = 'active';
      return {
        confirmMeteorCall: 'confirmEmailChange',
        namespace: 'confirmEmailChange',
        progressSteps: steps,
        refcode: this.params.refcode
      };
    },
    before: function() {
      updateLangBasedOnQueryString(this, i18n);
      this.next();
    }
  });

  this.route('reGenerateAllProductPasscodes', {
    path: '/re-generate-all-product-passcodes/:refcode',
    layoutTemplate: 'withoutUserLayout',
    template: 'reGenerateProductPasscodes',
    before: beforeRefPage,
    data() {
      return {
        type: 're-generate-all',
        refcode: this.params.refcode
      };
    }
  });

  this.route('reGenerateProductPasscode', {
    path: '/re-generate-product-passcode/:refcode',
    layoutTemplate: 'withoutUserLayout',
    template: 'reGenerateProductPasscodes',
    before: beforeRefPage,
    data() {
      return {
        type: 're-generate-one',
        refcode: this.params.refcode
      };
    }
  });

  const refRedirect = function() {
    const refcode = this.params.refcode;
    this.redirect('enrollWizard', {refcode: refcode});
  };

  this.route('bref', {
    path: '/bref/:refcode',
    before: refRedirect
  });

  this.route('dref', {
    path: '/dref/:refcode',
    before: refRedirect
  });


  // reorder Product
  this.route('/reorder', {
    name: 'reorder',
    before: function() {
      if (Meteor.settings.public.salesOver) {
        this.render('notificationPanel');
      } else {
        this.next();
      }
    },
    data() {
      return {message: 'messages.salesOver'}
    },
  });
  this.route('/account/reorder', {
    name: 'accountreorder',
    template: 'reorder',
    before: function() {
      if (Meteor.settings.public.salesOver) {
        this.render('notificationPanel');
      } else {
        this.next();
      }
    },
    data() {
      return {message: 'messages.salesOver'}
    },
  });

  this.route('/reorder/thank-you', {
    name: 'reorderThankYou',
    template: 'thankYouPanel',
    data() {
      return {message: 'messages.reorderThankYou'};
    }
  });

  this.route('/regionalError', {
    name: 'regionalError',
    template: 'regionalError',
    path: '/regionalError',
  });

  // Enrollment wizard
  this.route('/enroll/thank-you', {
    name: 'enrollThankYou',
    template: 'thankYouPanel',
    data() {
      return {message: 'messages.enrollThankYou'};
    }
  });
  this.route('/enroll/thank-you-invoice', {
    name: 'enrollThankYouInvoice',
    template: 'thankYouPanel',
    data() {
      return {message: 'messages.enrollThankYouInvoice'};
    }
  });
  this.route('/enroll/thank-you-distributor', {
    name: 'enrollThankYouDistributor',
    template: 'thankYouPanel',
    data() {
      return {message: 'messages.enrollThankYouDistributor'};
    }
  });
  this.route('/enroll/:refcode/:step?', {
    name: 'enrollWizard',
    waitOn: function() {
      return [Meteor.subscribe('enrollRef', this.params.refcode)];
    },
    data: function() {
      return {
        curRef: function() {
          return Refs.findOne({refcode: this.refcode});
        },
        message: function() { return  Meteor.settings.public.salesOver? 'messages.salesOver':"" },
        refcode: this.params.refcode
      };
    },
    onBeforeAction: function() {
      if (Meteor.settings.public.salesOver){
        this.render('notificationPanel');
      } else {
        const ref = this.params.refcode;
        beforeRefPage.bind(this)();
        if (ref && !this.params.step) {
          this.redirect('enrollWizard', {refcode: ref, step: 'contact-information'});
        } else {
          this.next();
        }
      }
    },
    onAfterAction: function() {
      Session.set('Loading', false);
    }
  });

  this.route('signup', {
    path: '/signup/:refcode',
    layoutTemplate: 'withoutUserLayout',
    template: 'createPassword',
    data: function() {
      return {
        action: 'create',
        title: i18n('createPassword.create'),
        invalid: i18n('createPassword.invalidCreate'),
        button: i18n('createPassword.buttonCreate'),
        refcode: this.params.refcode
      };
    },
    before: beforeRefPage
  });

  this.route('/pay/:ticketId', {
    name: 'pay',
    onBeforeAction: function() {
      updateLangBasedOnQueryString(this, i18n);
      this.next();
    },
    waitOn: function() {
      return [Meteor.subscribe('enrollPaymentTicket', this.params.ticketId)];
    },
    data: function() {
      return {ticketId: this.params.ticketId};
    },
  });

  // this redirect is needed to keep old links that where sent out via email working!
  this.route('/pay/:ticketId/btc', {
    name: 'payBtc',
    onBeforeAction: function() {
      Router.go('pay', {ticketId: this.params.ticketId}, {query: this.params.query});
    }
  });

  this.route('partnerlink', {
    path: '/partnerlink',
    template: 'genref',
    data: function() {
      return {
        role: 'partner',
        roleName: i18n('roles.Partner'),
      };
    },
    before: function() {
      this.next();
    },
  });

  this.route('distref', {
    path: '/distref',
    template: 'genref',
    data: function() {
      return {
        role: 'distributor',
        roleName: i18n('roles.Distributor'),
        showTiersAndTimetype: true,
      };
    },
    before: function() {
      mustBeApprovedDistributor(this, () => {
        this.next();
      });
    }
  });

  this.route('buyerref', {
    path: '/buyerref',
    template: 'genref',
    data: function() {
      return {
        role: 'buyer',
        roleName: i18n('roles.Buyer'),
        showTimetype: true,
      };
    },
    before: function() {
      mustBeApprovedDistributor(this, () => {
        this.next();
      });
    }
  });

  this.route('purchases', {
    name: 'purchases',
    path: '/purchases',
    template: 'buyerPurchases'
  });

  this.route('viewpartnerlinks', {
    path: 'viewpartnerlinks',
    template: 'viewPartnerLinks'
  });

  this.route('viewlinks', {
    before: function() {
      mustBeApprovedDistributor(this, () => {
        this.next();
      });
    }
  });

  this.route('buyers', {
    before: function() {
      const mustBeApprovedDistributorOrAdmin = ((Meteor.user().isDistributor() && Meteor.user().isApproved()) || Meteor.user().isAdmin());
      validateRoutes(this, mustBeApprovedDistributorOrAdmin, () => {
        this.next();
      });
    }
  });

  this.route('commissions', {
    before: function() {
      const mustBeApprovedDistributorOrAdmin = ((Meteor.user().isDistributor() && Meteor.user().isApproved()) || Meteor.user().isAdmin());
      validateRoutes(this, mustBeApprovedDistributorOrAdmin, () => {
        this.next();
      });
    }
  });

  this.route('sale-overview', {
    before: function() {
      const roleAllowed = (Meteor.user() &&  (Meteor.user().isAdmin() || Meteor.user().isSysop()));
      validateRoutes(this, roleAllowed, () => {
        this.next();
      });
    },
    subscriptions: function() {
      return [Meteor.subscribe('salesTotals')];
    },
  });

  this.route('jobs-monitor', {
    path: '/jobs-monitor',
    template: 'jobsMonitor',
    before: function() {
      const roleAllowed = (Meteor.user() && Meteor.user().isSysop());
      validateRoutes(this, roleAllowed, () => {
        this.next();
      });
    }
  });

  this.route('account', {
    before: function() {
      const mustBeDistributorOrBuyer = Meteor.user().isDistributor() || Meteor.user().isBuyer();
      validateRoutes(this, mustBeDistributorOrBuyer, () => {
        this.next();
      });
    }
  });

  this.route('addCustomerServiceOfficer', {
    path: '/add-customer-service-officer',
    template: 'addCustomerServiceOfficer',
  });

  this.route('addComplianceOfficer');

  this.route('customerService', {
    path: '/customer-service',
    template: 'customerServiceDash',
    before: function() {
      if (Meteor.user().reviewing) {
        this.redirect('reviewUser');
      } else {
        this.next();
      }
    },
  });

  this.route('investigator', {
    path: '/investigator',
    template: 'investigatorDash',
    before: function() {
      if (Meteor.user().reviewing) {
        this.redirect('reviewUser');
      } else {
        this.next();
      }
    },
  });

  this.route('queue', {
    path: '/queue',
    template: 'queue',
    before: function() {
      if (Meteor.user().reviewing) {
        this.redirect('reviewUser');
      } else {
        this.next();
      }
    },
  });

  this.route('reviewUser', {
    path: '/review-user',
    template: 'reviewUser',
    waitOn: function() {
      return [
        Meteor.subscribe('currentlyReviewing'),
      ];
    },
    before: function() {
      if (!Meteor.user().reviewing) {
        if (Meteor.user().isCompliance()) {
          this.redirect('queue');
        } else if (Meteor.user().isCustomerService()) {
          this.redirect('customerService');
        } else if (Meteor.user().isInvestigator()) {
          this.redirect('investigator');
        } else {
          this.next();
        }
      } else {
        this.next();
      }
    },
  });

  this.route('complianceRecords', {
    path: '/compliance-records',
    template: 'complianceRecords',
    subscriptions: function complianceRecordsSubscriptions() {
      return [Meteor.subscribe('reviewRecords')];
    }
  });

  // HEAD INVOICE MANAGER
  this.route('invoice_queue', {
    path: 'invoiceManager/queue',
    template: 'invoiceQueue',
    before: function() {
      const hasValidRole = Roles.userIsInRole(Meteor.userId(), Meteor.users.getInvoiceManagerValidRoles());
      validateRoutes(this, hasValidRole, () => {
        this.next();
      });
    }
  });
});
