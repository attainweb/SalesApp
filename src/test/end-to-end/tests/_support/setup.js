'use strict';
import { residenceCountries } from '/test/end-to-end/tests/_support/residenceCountries';

module.exports = function() {

  this.Before(function() {
    // Reset the DB
    server.execute(() => {
      Package['xolvio:cleaner'].resetDatabase({
        excludedCollections: ['autoincrements', 'jobs.jobs']
      });
    });
    this.fixtures = {
      users: [],
      invoices: [],
      refs: []
    };
  });

  this.Before({tags: ["@withoutWorkers"]}, function() {
    // We don't wawnt ticket to be moved by workers while we test the queue
    server.execute(() => {
      const Jobs = require('/lib/collections/jobs.js').Jobs;
      Jobs.shutdownJobServer();
    });
  });

  this.After({tags: ["@withoutWorkers"]}, function() {
    // Restore job server
    server.execute(() => {
      const Jobs = require('/lib/collections/jobs.js').Jobs;
      Jobs.startJobServer();
    });
  });

  /**
   * If a given condition changes Meteor settings, it needs to restore
   * the original value not to interfere with following tests.
   **/
  this.restoreSettingsFnArray = [];

  this.setSalesStartedClosure = function(salesStatus) {
    return function() {
      server.execute((salesStarted) => {
        Meteor.settings.public.salesStarted = salesStarted;
      }, salesStatus);
    };
  };

  this.removeResidenceCountryAllowedSale = function(blockedCountry) {
    return function() {
      server.execute((country) => {
        _.remove(Meteor.settings.public.residenceCountriesAllowedSale, (element) => {
          return element === country;
        });
      }, blockedCountry);
    };
  };

  this.restoreResidenceCountryAllowedSale = function(blockedCountry) {
    return function() {
      server.execute((country) => {
        Meteor.settings.public.residenceCountriesAllowedSale.push(country);
      }, blockedCountry);
    };
  };

  this.Given(/The sales is (.*)/, (salesStatus) => {
    const prevSalesStatus = server.execute(() => {
      return Meteor.settings.public.salesStarted;
    });
    const newSalesStatus = (salesStatus === "started");
    if (newSalesStatus !== prevSalesStatus) {
      this.setSalesStartedClosure(newSalesStatus)();
      this.restoreSettingsFnArray.push(this.setSalesStartedClosure(prevSalesStatus));
    }
  });

  this.After(() => {
    this.restoreSettingsFnArray.forEach(function(fn) {
      fn();
    });
  });

  this.Given(/^the current tranche is blocking (.*) buyers$/, (blockedCountry) => {
    const prevResidenceCountriesAllowedSale = server.execute(() => {
      return Meteor.settings.public.residenceCountriesAllowedSale;
    });
    const _ = require('lodash');
    if ((_.indexOf(prevResidenceCountriesAllowedSale, blockedCountry)) >= 0) {
      this.removeResidenceCountryAllowedSale(blockedCountry)();
      this.restoreSettingsFnArray.push(this.restoreResidenceCountryAllowedSale(blockedCountry));
    }
  });

  this.Given(/^sales are allowed in (.*)$/, (countries) => {
    countries.split(', ').forEach((countryName) => {
      const country = residenceCountries[countryName];
      this.removeResidenceCountryAllowedSale(country)();
      this.restoreSettingsFnArray.push(this.restoreResidenceCountryAllowedSale(country));
    });
  });
};
