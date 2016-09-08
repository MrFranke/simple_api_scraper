const Brute = require('./brute');
const cluster = require('cluster');

const maxArraySize = 1000;

class Worker {
  constructor(from, to){
    this.from = from;
    this.to = to;
    this.range = this.to-this.from;
    console.log(`I am worker #${cluster.worker.id}, with PID: ${cluster.worker.process.pid}`);
    console.log(`Range: from ${from}, to ${to}`);
    this.startBrute();
  }

  formatUsersData(users){
    return users.map(userJson => {
      let user = JSON.parse(userJson);
      return user;
    }).filter(user => {
      return !user.error;
    });
  }

  finishBrute(users){
    console.log(`I worker #${cluster.worker.id}, finish brute and kill himself`);
    cluster.worker.kill();
  }

  startBrute(){
    let promises = new Brute(this.from, this.to).start();
    Promise.all(promises).then(users => {
      process.send({users: this.formatUsersData(users)});
      this.finishBrute(users)
    });
  }
}

new Worker(process.env['CHUNK-START'], process.env['CHUNK-END']);
