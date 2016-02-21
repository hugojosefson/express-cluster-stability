import cluster from 'cluster';

export default (workerFunction, options) => {
    const server = workerFunction(options);
    options.handleUncaughtException && process.on('uncaughtException', err => {
        process.send('crashing');
        server.close(err => {
            if (err) {
                options.log.error('Could not close express app', err);
                process.exit(2);
            } else {
                process.exit(1);
            }
        });
        cluster.worker.disconnect();
        options.log.fatal('uncaughtException', err);
    });
};
