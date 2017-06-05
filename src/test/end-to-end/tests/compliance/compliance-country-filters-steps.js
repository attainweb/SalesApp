import { residenceCountries, getTranslatedCountry } from '/test/end-to-end/tests/_support/residenceCountries';
import { waitAndUncheck, getQueueItemValueByEmail } from '/test/end-to-end/tests/_support/webdriver';
import _ from 'lodash';




module.exports = function() {

  this.Then(/^I see all users with theirs country of residence$/, function() {
    const queueId = ".table";
    client.waitForVisible(queueId);

    const allUsers = server.execute(() => {
      return Meteor.users.find({
        roles: {
          $in: ['buyer', 'distributor']
        }
      }).fetch();
    });

    expect(allUsers.length).to.be.above(0);
    allUsers.forEach( user => {
      const selector = getQueueItemValueByEmail(user.emails[0].address, 'residenceCountry');
      const actualValue = client.execute(pageSelector => { return $(pageSelector).text(); }, selector).value;
      const expectedValue = client.execute(getTranslatedCountry, user.personalInformation.residenceCountry).value;
      expect(actualValue.trim()).to.equal(expectedValue);
    });
  });


  this.When(/^I deselect (.*) option from the country filter$/, function(countryName) {
    const country = residenceCountries[countryName];
    const filterId = `input[value=${country}]`;
    waitAndUncheck(filterId);
  });

  this.Then(/^I should only see (.*) users listed$/, function(countries) {

    const queueId = ".table";
    client.waitForVisible(queueId);

    const visibleCountries = countries.split(/ and +/);
    const visibleCountriesCodes = _.transform(visibleCountries, (result, countryName) => {
      result.push(residenceCountries[countryName]);
    });

    const users = server.execute(() => {
      return Meteor.users.find({
        roles: {
          $in: ['buyer', 'distributor']
        }
      }).fetch();
    });

    expect(users.length).to.be.above(0);
    users.forEach( user => {
      const selector = getQueueItemValueByEmail(user.emails[0].address, 'name');
      const name = client.execute(function(pageSelector) {
        return $(pageSelector).text();
      }, selector).value;
      const shouldBeVisible = _.includes(visibleCountriesCodes, user.personalInformation.residenceCountry);
      if (shouldBeVisible) {
        expect(name).to.equal(user.personalInformation.name);
      } else {
        expect(name).to.equal('');
      }
    });
  });


};
