(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _nasa = __webpack_require__(1);

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
	  var sessionAttributes = {};
	  var cardTitle = 'Welcome to Space Ball';
	  var speechOutput = 'Welcome to Space Ball. Find out if you are in danger from near earth objects by asking, Space Ball, am I in danger?';
	  // If the user either does not reply to the welcome message or says something that is not
	  // understood, they will be prompted again with this text.
	  var repromptText = 'You can also ask me, Space Ball are we all going to die.';
	  var shouldEndSession = false;

	  callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}

	// Help
	function getHelpResponse(callback) {
	  var sessionAttributes = {};
	  var cardTitle = 'Help';
	  var speechOutput = 'SpaceBall finds objects near the earth for a given day. You can ask.';
	  var repromptText = '';
	  var shouldEndSession = false;
	  callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}

	// Intent matches
	function onIntent(intentRequest, session, callback) {
	  var intent = intentRequest.intent;
	  var intentName = intentRequest.intent.name;

	  // Dispatch to your skill's intent handlers
	  if ('SpaceBall' === intentName) {
	    (0, _nasa.checkNEOs)(intent.slots.Date.value, function (speechOutput) {
	      var cardTitle = intent.name;
	      var sessionAttributes = {};
	      var shouldEndSession = true;
	      var repromptText = '';
	      callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	    });
	  } else if ('AMAZON.HelpIntent' === intentName) {
	    getHelpResponse(callback);
	  } else {
	    throw 'Invalid intent';
	  }
	}

	// Called when the user ends the session.
	// Is not called when the skill returns shouldEndSession=true.
	function onSessionEnded(sessionEndedRequest, session) {
	  console.log('End session: requestId=' + request.requestId + ' sessionId=' + session.sessionId);
	}

	// Called when the session starts.
	function onSessionStarted(request, session) {
	  console.log('New session: requestId=' + request.requestId + ' sessionId=' + session.sessionId);
	}

	// Called when the user launches the skill without specifying what they want.
	function onLaunch(launchRequest, session, callback) {
	  getWelcomeResponse(callback);
	}

	// Handle the incoming request based on type (LaunchRequest, IntentRequest)
	module.exports.handler = function (event, context, callback) {
	  try {

	    // Verify application id
	    if (event.session.application.applicationId !== process.env.APPLICATION_ID) {
	      return callback('Invalid Application ID');
	    }

	    if (event.session.new) {
	      onSessionStarted(event.request, event.session);
	    }

	    if (event.request.type === 'LaunchRequest') {
	      onLaunch(event.request, event.session, function (sessionAttributes, speechletResponse) {
	        callback(null, buildResponse(sessionAttributes, speechletResponse));
	      });
	    } else if (event.request.type === 'IntentRequest') {
	      onIntent(event.request, event.session, function (sessionAttributes, speechletResponse) {
	        callback(null, buildResponse(sessionAttributes, speechletResponse));
	      });
	    } else if (event.request.type === 'SessionEndedRequest') {
	      onSessionEnded(event.request, event.session);
	      callback(null);
	    }
	  } catch (e) {
	    callback('Error: ' + e);
	  }
	};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.checkNEOs = checkNEOs;
	var https = __webpack_require__(2);

	function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function getNEO(startDate, endDate, callback) {
	  return https.get({
	    host: 'api.nasa.gov',
	    path: '/neo/rest/v1/feed?start_date=' + startDate + '&end_date=' + endDate + '&api_key=' + process.env.NASA_API_KEY
	  }, function (response) {
	    // Continuously update stream with data
	    var body = '';
	    response.on('data', function (d) {
	      body += d;
	    });
	    response.on('end', function () {
	      console.log(body);
	      callback(JSON.parse(body));
	    });
	  });
	}

	// Contact Nasa.
	function checkNEOs(rawDate, callback) {
	  var date = new Date(rawDate).toISOString().split('T')[0];
	  var speechOutput = '';

	  var responses = ["So no you are not going to die... not from this asteroid... but don't push your luck.", "So you're probably ok but did you get a flu shot?", "So death by asteroid is out, but I've heard Godzilla might be back.", "So no celestial object will be ending your life, but don't take apples from anyone that looks like a witch.", 'Seriously though asteroids are the least of your worries. You might want to watch your diet.', 'But you really should get some exercise.'];

	  getNEO(date, date, function (results) {

	    speechOutput = 'Dear me, there are ' + results.element_count + ' objects near the earth. ';

	    for (var neo in results.near_earth_objects) {
	      var neos = results.near_earth_objects[neo];
	      for (var i = 0; i < neos.length; i++) {
	        var astroid = neos[i];
	        speechOutput = speechOutput + astroid.name + " is between " + Math.round(astroid.estimated_diameter.meters.estimated_diameter_min) + " and " + Math.round(astroid.estimated_diameter.meters.estimated_diameter_max) + " meters in size" + " moving at " + Math.round(astroid.close_approach_data[0].relative_velocity.kilometers_per_hour) + " kilometers per hour" + " and will miss the earth by " + Math.round(astroid.close_approach_data[0].miss_distance.kilometers) + " kilometers.";
	        if (astroid.is_potentially_hazardous_asteroid) {
	          speechOutput = speechOutput + " It could kill us. Run for the hills. You're all going to die! ";
	        } else {
	          speechOutput = speechOutput + " It poses no threat. " + responses[getRandomInt(0, responses.length - 1)];
	        }
	      }
	    }
	    callback(speechOutput);
	  });
	}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = require("https");

/***/ })
/******/ ])));