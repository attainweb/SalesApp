'use strict';
import faker from "faker";

const createFile = function(fileName, userId, canBeDeleted = true, connectionId = undefined) {
  const key = `files/${faker.random.number()}_${fileName}`;
  const file = {
    "key": key,
    "name": fileName,
    "url": `https://bucket.amazon-region.amazonaws.com/${key}`,
    "userId": userId,
    "canBeDeleted": canBeDeleted,
    "connectionId": connectionId
  };
  return server.execute( (newFile) => {
    const id = Files.insert(newFile);
    return Files.findOne({_id: id});
  }, file);
};

module.exports.createFile = createFile;

module.exports = function() {

  this.Before(function() {
    server.execute(() => {
      const stubUploadFilesService = require('/imports/lib/fixtures/upload-files-service-stub.js');
      require('/imports/server/upload-files-service.js').configure(stubUploadFilesService.create());
    });
  });

  this.Given(/^an image was uploaded for that (.+)$/, function(user) {
    this.user = this.accounts.getUserByKey(user);
    this.file = createFile("canBeDeletedImage.jpg", this.user._id, true);
  });
  this.Given(/^in a previous approval stage an image was uploaded for that (.+)$/, function(user) {
    this.user = this.accounts.getUserByKey(user);
    this.file = createFile("cantBeDeletedImage.jpg", this.user._id, false);
  });

};
