import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'upload';
let template;
let _getFileFromInput = ( event ) => event.target.files[0];
let _setPlaceholderText = ( string = "Click or Drag a File Here to Upload" ) => {
  template.find( ".alert span" ).innerText = string;
};

let _progressFunc = function() {
  if ( _.isNumber(this.progress()) && !_.isNaN(this.progress()) ) {
    return Math.round(this.progress() * 100);
  }
  return 0;
};

let _addUrlToDatabase = ( url, key, name, ownerId ) => {
  Meteor.call( "storeUrlInDatabase", url, key, name, ownerId, ( error ) => {
    if ( error ) {
      // Bert.alert( error.reason, "warning" );
      i18nAlert(error, I18N_ERROR_NAMESPACE, error.reason);
      _setPlaceholderText();
    } else {
      // Bert.alert( "File uploaded to Amazon S3!", "success" );
      _setPlaceholderText();
    }
  });
};
let _uploadFileToAmazon = ( file, ownerId ) => {
  const uploader = new Slingshot.Upload( "uploadToS3" );
  uploader.progressFunc = _progressFunc;
  uploader.send( file, ( error, url ) => {
    if ( error ) {
      i18nAlert({error: 'uploadDenied'}, I18N_ERROR_NAMESPACE, error.reason);
      _setPlaceholderText();
    } else {
      const key = _.find(uploader.instructions.postData, function(el) { return el.name === 'key'; });
      _addUrlToDatabase( url, key.value, file.name, ownerId );
    }
  });
  return uploader;
};


let upload = ( options ) => {
  template = options.template;
  let file = _getFileFromInput( options.event );
  _setPlaceholderText( `Uploading ${file.name}...` );
  return _uploadFileToAmazon( file, options.ownerId );
};

Modules.client.uploadToS3 = upload;
