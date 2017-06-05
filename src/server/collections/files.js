'use strict';

import Logger from '/imports/server/lib/logger';
import { getUploadFilesService } from '/imports/server/upload-files-service';

Logger.info('Files transformation for AWS url signing');
// This constant should probably be removed from global scope!
// It causes a smelly pattern if called from outside this file.
const params = {Bucket: Meteor.settings.SLINGSHOT_S3_BUCKET};

const getSignedUrl = (key) => {
  const params = {
    Bucket: Meteor.settings.SLINGSHOT_S3_BUCKET,
    Key: key
  };
  try {
    // This call will throw an error if the file doesn't exists on S3, resulting in a return of undefined.
    getUploadFilesService().headObjectSync(params);
    return getUploadFilesService().getSignedUrlSync('getObject', params);
  } catch (error) {
    return undefined;
  }
}

Files._transform = function(doc) {
  doc.signedUrl = getSignedUrl(doc.key) || getSignedUrl(encodeURI(doc.key));
  return doc;
};

// Reference link: https://github.com/CulturalMe/meteor-slingshot/issues/50
const removeAmazonS3Images = (fileKey, cb) => {
  Logger.info("[Files.removeAmazonS3Images] - Starting", 'file key:', fileKey);
  Meteor.wrapAsync(
    getUploadFilesService().deleteObject({
      Bucket: Meteor.settings.SLINGSHOT_S3_BUCKET,
      Key: fileKey
    }, Meteor.bindEnvironment(function(error, result) {
      if (error) {
        Logger.error('[Files.removeAmazonS3Images] - Error', error);
      } else {
        Logger.info('[Files.removeAmazonS3Images] - Success', result);
        if (typeof cb === 'function') cb(fileKey);
      }
    }))
  );
};

/* Only use this method if you need to remove a file (don't use the default method of the collection) */
Files.removeFile = function removeFile(fileId) {
  Logger.info('[Files.removeFile] - Starting', 'file id:', fileId);
  const file = Files.findOne(fileId);
  if (file) {
    if (file.canBeDeleted) {
      removeAmazonS3Images(file.key, (key) => {
        const result = Files.remove({key: key });
        Logger.info("[Files.removeFile] - Success", 'number of removed files:', result);
      });
    } else {
      Logger.error("[Files.removeFile] - File can't be deleted", 'file id:', file._id);
      throw new Meteor.Error('fileCantBeDeleted');
    }
  } else {
    Logger.error("[Files.removeFile] - File doesn't exist on the DB", 'file id:', fileId);
  }
};

Files.blocksUserExistingFiles = function blockUserExistingFiles(userId) {
  Logger.info('[Files.blockUserExistingFiles] - Starting', 'user id:', userId);
  const result = Files.update({userId: userId, canBeDeleted: true}, {$set: {canBeDeleted: false}}, { multi: true });
  Logger.info('[Files.blockUserExistingFiles] - Finished', 'user id:', userId, "number of block files", result);
};
