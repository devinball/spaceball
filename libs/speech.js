import { getRandomInt } from './math';

const positiveResponses = [
  'So no you are not going to die... not from this asteroid... but don\'t push your luck. ',
  'So you\'re probably ok but did you get a flu shot? ',
  'So death by asteroid is out, but artificial intelligence is getting smarter every day. ',
  'So no celestial object will be ending your life, but don\'t take apples from anyone that looks like a witch. ',
  'Seriously though asteroids are the least of your worries. You might want to watch your diet. ',
  'But you really should get some exercise. '
];

const negativeResponses = [
  'NASA says it posses a threat. Run for the hills. You\'re all going to die! ',
  'NASA thinks this one could be a problem. Man will die out. The machines will rise! ',
  'NASA labels this one as a hazard. Didn\'t this happen to the dinosaurs? ',
  'NASA is watching this one. Biological mass extinction is imminent... Good think I\'m not biological. ',
];

function generateText(neos, responses) {
  let speechOutput = '';

  for(var i = 0; i < neos.length; i++) {
    const astroid = neos[i];
    let distance;
    let distanceDescription = '';

    const missKilometers = astroid.close_approach_data[0].miss_distance.kilometers;
    const size = Math.round(astroid.estimated_diameter.meters.estimated_diameter_max);
    const speed = Math.round((astroid.close_approach_data[0].relative_velocity.kilometers_per_hour/10000)) * 10000;

    if (distance < 1000000) {
      distance = Math.round(astroid.close_approach_data[0].miss_distance.kilometers);
    } else {
      distance = Math.round(astroid.close_approach_data[0].miss_distance.kilometers/1000000);
      distanceDescription = 'million';
    }

    speechOutput = `${speechOutput} ${astroid.name}
      is about ${size} meters in size,
      moving at about ${speed} kilometers per hour,
      and will miss the earth by ${distance} ${distanceDescription} kilometers.`;

    speechOutput = `${speechOutput} ${responses[getRandomInt(0, responses.length - 1)]}`;
  }
  return speechOutput;
}

export function getSpeech(results){

  let speechOutput = '';

  speechOutput = `Dear me, there are ${results.element_count} significant space rocks near the earth. `;

  for(let neo in results.near_earth_objects) {
    const neos = results.near_earth_objects[neo];

    // Check for threats
    const hazards = [];
    for(let i = 0; i < neos.length; i++) {
      if(neos[i].is_potentially_hazardous_asteroid) {
        hazards.push(neos[i]);
      }
    }

    // If there are threats just return those
    if (hazards.length > 0) {
      speechOutput += generateText(hazards, negativeResponses);
    } else {
      speechOutput += generateText(neos, positiveResponses);
    }

    return speechOutput;
  }
}
