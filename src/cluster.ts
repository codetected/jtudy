import cluster from 'cluster';
const cCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log('마스터');
    // Create a worker for each CPU
    for (var i = 0; i < cCPUs; i++) {
        cluster.fork();
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online.');
    });
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died.');
    });
} else {
    console.log('워커');
}
