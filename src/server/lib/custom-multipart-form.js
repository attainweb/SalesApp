const customMultipartForm = function(parts) {
  const boundary = '----' + (new Date()).getTime();
  const bodyString = [];

  _.each(parts, function(value, name) {

    if ( name === 'attachment' ) {
      bodyString.push(
        '--' + boundary,
        'Content-Disposition: form-data; name="' + name + '"; filename="' + value.filename + '"',
        'Content-type: ' + value.contentType,
        'Content-Transfer-Encoding: base64',
        '',
        value.value);
    } else {
      bodyString.push(
        '--' + boundary,
        'Content-Disposition: form-data; name="' + name + '"',
        '',
        value);
    }

  });

  bodyString.push('--' + boundary + '--', '');

  return {
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary
    },
    content: bodyString.join('\r\n'),
  };

};
CustomMultipartForm = customMultipartForm;
