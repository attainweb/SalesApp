'use strict';

import { expect } from 'meteor/practicalmeteor:chai';
import { getRequiredLevel } from '/imports/server/users/compliance-level';

describe('ComplianceLevel', function() {

  describe('getRequiredLevel', function() {
    const accountTypes = ['personal', 'company'];

    const scenariosDaily = {
      personal: [
        {amount: 4799, level: 1},
        {amount: 4800, level: 2},
        {amount: 4801, level: 2},
      ],
      company: [
        {amount: 4799, level: 1},
        {amount: 4800, level: 2},
        {amount: 4801, level: 2},
      ]
    };

    const scenariosMonthly = {
      personal: [
        {amount: 23999, level: 1},
        {amount: 24000, level: 2},
        {amount: 24001, level: 2},
        {amount: 79999, level: 2},
        {amount: 80000, level: 3},
        {amount: 80001, level: 3},
      ],
      company: [
        {amount: 23999, level: 1},
        {amount: 24000, level: 2},
        {amount: 24001, level: 2},
        {amount: 79999, level: 2},
        {amount: 80000, level: 3},
        {amount: 80001, level: 3},
      ]
    };

    const scenariosTotal = {
      personal: [
        {amount:  799999, level:  1},
        {amount:  800000, level:  4},
        {amount:  800001, level:  4},
        {amount: 1299999, level:  4},
        {amount: 1300000, level:  5},
        {amount: 1300001, level:  5},
        {amount: 1799999, level:  5},
        {amount: 1800000, level:  6},
        {amount: 1800001, level:  6},
        {amount: 2299999, level:  6},
        {amount: 2300000, level:  7},
        {amount: 2300001, level:  7},
        {amount: 2799999, level:  7},
        {amount: 2800000, level:  8},
        {amount: 2800001, level:  8},
        {amount: 3299999, level:  8},
        {amount: 3300000, level:  9},
        {amount: 3300001, level:  9},
        {amount: 3799999, level:  9},
        {amount: 3800000, level: 10},
        {amount: 3800001, level: 10},
      ],
      company: [
        {amount:  499999, level:  1},
        {amount:  500000, level:  4},
        {amount:  500001, level:  4},
        {amount:  999999, level:  4},
        {amount: 1000000, level:  5},
        {amount: 1000001, level:  5},
        {amount: 1499999, level:  5},
        {amount: 1500000, level:  6},
        {amount: 1500001, level:  6},
        {amount: 1999999, level:  6},
        {amount: 2000000, level:  7},
        {amount: 2000001, level:  7},
        {amount: 2499999, level:  7},
        {amount: 2500000, level:  8},
        {amount: 2500001, level:  8},
        {amount: 2999999, level:  8},
        {amount: 3000000, level:  9},
        {amount: 3000001, level:  9},
        {amount: 3499999, level:  9},
        {amount: 3500000, level: 10},
        {amount: 3500001, level: 10},
      ]
    };

    const testGetRequiredLevel = function(scenario) {
      const name = this.name;
      const accountType = this.accountType;
      const purchaseTotals = {
        daily: (this.includeDaily ? scenario.amount : 0),
        monthly: (this.includeMonthly ? scenario.amount : 0),
        total: (this.includeTotal ? scenario.amount : 0),
      }
      it(`with account type: ${accountType} and ${name}: ${scenario.amount} should get level: ${scenario.level}`, function() {
        expect(getRequiredLevel(accountType, purchaseTotals)).to.equal(scenario.level);
      });
    };

    accountTypes.forEach(function(accountType) {
      // These tests lets daily, monthly and total to be tested independently
      // Proper testing should also test the combination of these.

      scenariosDaily[accountType].forEach(testGetRequiredLevel, {
        name: 'daily purchase',
        accountType: accountType,
        includeDaily: true,
      });
      scenariosMonthly[accountType].forEach(testGetRequiredLevel, {
        name: 'montly purchase',
        accountType: accountType,
        includeMonthly: true,
      });
      scenariosTotal[accountType].forEach(testGetRequiredLevel, {
        name: 'purchase total',
        accountType: accountType,
        includeTotal: true,
      });

    });

  }); // end getRequiredLevel
});
