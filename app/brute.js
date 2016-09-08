const User = require('./user');
const RateLimiter = require('limiter').RateLimiter;

class Bruter {
  constructor(from=1, to=10) {
    this.limiter = new RateLimiter(1, 300)
    this.from = Number(from);
    this.to = Number(to);
  }

  getData(id) {
    let promise = User.get(id, this.limiter);
    promise.then(data => {
      let user = JSON.parse(data);
      if (!user.semail) { return; }
      console.log('[' + new Date() + '] get user with email: ', user.semail);
    }, error => {
      new Error(error);
    })
    return promise;
  }

  getRange(from, to) {
    let promises = [];
    for (let i = 0; i < to-from; i++) {
      let id = i+1+from;
      promises.push(this.getData(id));
    }

    return promises;
  }

  start() {
    let promises = this.getRange(this.from, this.to);
    return promises;
  }
}

module.exports = Bruter;
