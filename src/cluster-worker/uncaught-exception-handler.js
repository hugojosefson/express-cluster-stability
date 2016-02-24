import cluster from 'cluster';

export default ({log, workerKillTimeout}, server) => err => {
    process.send('crashing');
    cluster.worker.disconnect();
    log.fatal('uncaughtException', err);
    if (server && typeof server.close === 'function') {
        server.close(err => {
            if (err) {
                log.error('Could not close express app', err);
                process.exit(2);
            } else {
                process.exit(1);
            }
        });
    } else {
        log.warn(`No server with .close() method was returned from workerFunction. Exiting anyway in ${workerKillTimeout} ms...`);
        setTimeout(() => process.exit(1), workerKillTimeout);
    }
};
