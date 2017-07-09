import https from 'https';
import { getSpeech } from './speech';

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

  getNEO(date, date, (results) => {
    callback(getSpeech(results));
  });

}

