import { checkNEOs } from './libs/nasa';

function buildResponse(sessionAttributes, speechletResponse) {
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  return {
    outputSpeech: {
      type: 'PlainText',
      text: output
    },
    card: {
      type: 'Simple',
      title: title,
      content: output
    },
    reprompt: {
      outputSpeech: {
        type: 'PlainText',
        text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
}

// Welcome
function getWelcomeResponse(callback) {
  // If we wanted to initialize the session to have some attributes we could add those here.
  const sessionAttributes = {};
  const cardTitle = 'Welcome to Space Ball';
  const speechOutput = 'Welcome to Space Ball. Find out if you are in danger from near earth objects by asking, Space Ball, am I in danger?';
  // If the user either does not reply to the welcome message or says something that is not
  // understood, they will be prompted again with this text.
  const repromptText = 'You can also ask me, Space Ball are we all going to die.';
  const shouldEndSession = false;

  callback(sessionAttributes,
    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// Help
function getHelpResponse(callback) {
  const sessionAttributes = {};
  const cardTitle = 'Help';
  const speechOutput = 'SpaceBall finds objects near the earth for a given day. You can ask.';
  const repromptText = '';
  const shouldEndSession = false;
  callback(sessionAttributes,
    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// Intent matches
function onIntent(intentRequest, session, callback) {
  const intent = intentRequest.intent;
  const intentName = intentRequest.intent.name;

  // Dispatch to your skill's intent handlers
  if('SpaceBall' === intentName) {
    checkNEOs(intent.slots.Date.value, (speechOutput) => {
      const cardTitle = intent.name;
      const sessionAttributes = {};
      const shouldEndSession = true;
      const repromptText = '';
      callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    });
  } else if('AMAZON.HelpIntent' === intentName) {
    getHelpResponse(callback);
  } else {
    throw 'Invalid intent';
  }
}

// Called when the user ends the session.
// Is not called when the skill returns shouldEndSession=true.
function onSessionEnded(sessionEndedRequest, session) {
  console.log(`End session: requestId=${request.requestId} sessionId=${session.sessionId}`);
}

// Called when the session starts.
function onSessionStarted(request, session) {
  console.log(`New session: requestId=${request.requestId} sessionId=${session.sessionId}`);
}

// Called when the user launches the skill without specifying what they want.
function onLaunch(launchRequest, session, callback) {
  getWelcomeResponse(callback);
}

// Handle the incoming request based on type (LaunchRequest, IntentRequest)
module.exports.handler = function(event, context, callback) {
  try {

    // Verify application id
    if(event.session.application.applicationId !== process.env.APPLICATION_ID) {
      return callback('Invalid Application ID');
    }

    if(event.session.new) {
      onSessionStarted(event.request, event.session);
    }

    if(event.request.type === 'LaunchRequest') {
      onLaunch(event.request,
        event.session,
        (sessionAttributes, speechletResponse) => {
          callback(null, buildResponse(sessionAttributes, speechletResponse));
        });
    } else if(event.request.type === 'IntentRequest') {
      onIntent(event.request,
        event.session,
        (sessionAttributes, speechletResponse) => {
          callback(null, buildResponse(sessionAttributes, speechletResponse));
        });
    } else if(event.request.type === 'SessionEndedRequest') {
      onSessionEnded(event.request, event.session);
      callback(null);
    }
  } catch(e) {
    callback(`Error: ${e}`);
  }
};
