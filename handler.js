'use strict';

module.exports.spaceBall = (event, context, callback) => {

  const response = {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: `Your lucky number is 4`,
      },
      shouldEndSession: false,
    },
  };

  callback(null, response);
};
