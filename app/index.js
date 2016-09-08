const jsonfile = require('jsonfile');
const exec = require('child_process').exec;
const colors = require('colors/safe');
const cluster = require('cluster');
const config = jsonfile.readFileSync('./app/config.json');
const numWorkers = require('os').cpus().length;
const fs = require('fs');

let counter = numWorkers;

function finish () {
  console.log(colors.green('=======!!!======= FINISH! =======!!!======='));
  exec('say Жатва закончена');
}

function messageHandler ( data ) {
  fs.readFile(config.fileName, 'utf8', (err, fileJSON) => {
    if (err) throw err;
    let fileData = JSON.parse(fileJSON);
    let rewriteData = fileData.concat(data.users);
    fs.writeFile(config.fileName, JSON.stringify(rewriteData));
  });
}

function exitHandler () {
  --counter;
  if (!counter) {
    finish();
  }
}

function createWorkers (range=[0, 1000]) {
  let size = (range[1] - range[0]);

  for(let i = 1; i < numWorkers+1; i++) {
    let step = Math.ceil(size/numWorkers);
    let chunk = [(step*i)-step+1, step*i > range[1] ? range[1] : step*i ];
    let env = {
          "CHUNK-START": chunk[0],
          "CHUNK-END": chunk[chunk.length-1]
        };
    cluster.fork(env);
  }

  Object.keys(cluster.workers).forEach((id) => {
    cluster.workers[id].on('message', messageHandler);
    cluster.workers[id].on('exit', exitHandler);
  });
}

fs.writeFile(config.fileName, JSON.stringify([]) );

cluster.setupMaster({exec: "./app/worker.js"});
createWorkers(config.range);
