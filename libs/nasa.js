import https from 'https';
import { getSpeech } from './speech';
import { getDateFromSlot } from './dates';

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
  const date = getDateFromSlot(rawDate);

  getNEO(
    date.startDate.toISOString().split('T')[0],
    date.endDate.toISOString().split('T')[0],
    (results) => {
    callback(getSpeech(results));
  });

}
