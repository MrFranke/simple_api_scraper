const request = require("request");
const jsonfile = require('jsonfile');
const config = jsonfile.readFileSync(`${__dirname}/config.json`);
const http = require('http');

class User {
  constructor() {

  }

  static get( id, limiter ) {
    let promise = new Promise((resolve, reject) => {
      limiter.removeTokens(1, function() {
        request({
          method: 'GET',
          uri: config.api+'/stats?ajax_id=0&user='+id,
          pool: new http.Agent({maxSockets: Infinity, _maxListeners: Infinity})
        }, (error, response, body) => {
          if ( error ) {
            reject(error);
            return;
          }
          resolve(body)
        });
      });
    });
    return promise;
  }
}

module.exports = User;
