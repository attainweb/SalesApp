module.exports = function() {
  this.Before(function() {
    this.router = {
      rootUrl: server.execute(() => Meteor.absoluteUrl()),
      home() {
        browser.url(this.rootUrl);
      },
      visit(path) {
        browser.url(this.rootUrl + path);
      },
      visitAbsolute(absolutePath) {
        browser.url(absolutePath);
      },
      goToLogin() {
        browser.url(this.rootUrl);
        client.waitForExist("#login", 5000); // wait until it dissapears
      }
    };
  });

  this.When(/^I navigate to ([^"]*)$/, function(path) {
    this.router.visit(path);
  });

  this.When(/^Refresh the screen$/, function() {
    client.refresh();
  });
};
