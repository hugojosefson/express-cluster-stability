export default ({log, workerKillTimeout}, server) => {
    if (server && typeof server.close === 'function') {
        server.close(() => process.exit(1));
    } else {
        log.warn(`No server with .close() method received (yet?) from workerFunction. Exiting anyway in ${workerKillTimeout} ms...`);
        setTimeout(() => process.exit(1), workerKillTimeout);
    }
};
