const https = require('https');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNEO(startDate, endDate, callback) {
  return https.get({
    host: 'api.nasa.gov',
    path: `/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${process.env.NASA_API_KEY}`
  }, (response) => {
    // Continuously update stream with data
    var body = '';
    response.on('data', (d) => {
      body += d;
    });
    response.on('end', () => {
      callback(JSON.parse(body));
    });
  });
}

// Contact Nasa.
export function checkNEOs(rawDate, callback) {
  let date;
  if (rawDate) {
    date = new Date(rawDate);
  } else {
    date = new Date();
  }

  date = date.toISOString().split('T')[0];

  let speechOutput = '';

  const responses = [
    "So no you are not going to die... not from this asteroid... but don't push your luck.",
    "So you're probably ok but did you get a flu shot?",
    "So death by asteroid is out, but I've heard Godzilla might be back.",
    "So no celestial object will be ending your life, but don't take apples from anyone that looks like a witch.",
    'Seriously though asteroids are the least of your worries. You might want to watch your diet.',
    'But you really should get some exercise.'
  ];

  getNEO(date, date, (results) => {

    speechOutput = `Dear me, there are ${results.element_count} objects near the earth. `;

    for(let neo in results.near_earth_objects) {
      const neos = results.near_earth_objects[neo];
      for(var i = 0; i < neos.length; i++) {
        const astroid = neos[i];
        speechOutput = speechOutput +
          astroid.name +
          " is about " + Math.round(astroid.estimated_diameter.meters.estimated_diameter_max) + " meters in size," +
          " moving at " + Math.round((astroid.close_approach_data[0].relative_velocity.kilometers_per_hour/10000)*10000) + " kilometers per hour" +
          " and will miss the earth by " + Math.round(astroid.close_approach_data[0].miss_distance.kilometers/1000000) + " million kilometers.";
        if(astroid.is_potentially_hazardous_asteroid) {
          speechOutput = speechOutput + " It could kill us. Run for the hills. You're all going to die! "
        } else {
          speechOutput = speechOutput + " It poses no threat. " + responses[getRandomInt(0, responses.length - 1)];
        }
      }
    }
    callback(speechOutput);
  });

}

