'use strict';

require('/imports/lib/fixtures/upload-files-service-stub.js');

let uploadFilesService = new AWS.S3({apiVersion: '2006-03-01'});

export const getUploadFilesService = function() {
  return uploadFilesService;
};

export const configure = function(newUploadFilesService) {
  uploadFilesService = newUploadFilesService;
};
