import cluster from 'cluster';

export default (server, log) => err => {
    process.send('crashing');
    server.close(err => {
        if (err) {
            log.error('Could not close express app', err);
            process.exit(2);
        } else {
            process.exit(1);
        }
    });
    cluster.worker.disconnect();
    log.fatal('uncaughtException', err);
};
