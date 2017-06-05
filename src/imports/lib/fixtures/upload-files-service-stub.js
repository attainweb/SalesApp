'use strict';

export const create = function() {
  const uploadFilesService = {};

  // TODO: do it when we need it!
  uploadFilesService.getSignedUrlSync = function getSignedUrlSync(method, objectKey, params) {
    return undefined;
  };

  // allways works..
  uploadFilesService.deleteObject = function deleteObject({bucket, key}, cb) {
    return cb(undefined, {});
  };

  return uploadFilesService;
};
