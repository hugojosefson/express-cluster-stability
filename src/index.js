import cluster from 'cluster';
import os from 'os';

import processName from './process-name';
import log from './log-factory';

const defaultOptions = {
    numberOfWorkers: process.env.EXPRESS_CLUSTER_NUMBER_OF_WORKERS || os.cpus().length,
    handleUncaughtException: process.env.EXPRESS_CLUSTER_HANDLE_UNCAUGHT_EXCEPTION !== 'false',
    workerRespawnDelay: process.env.EXPRESS_CLUSTER_WORKER_RESPAWN_DELAY || 1000,
    workerKillTimeout: process.env.EXPRESS_CLUSTER_WORKER_KILL_TIMEOUT || 30000,
    logLevel: process.env.EXPRESS_CLUSTER_LOG_LEVEL || 'info'
};

const clusterStability = (workerFunction, options = {}, masterFunction) => {
    if (typeof workerFunction !== 'function') {
        throw new Error('workerFunction must be supplied.');
    }

    const effectiveOptions = Object.assign({}, defaultOptions, options);
    effectiveOptions.log = log(effectiveOptions.logLevel, effectiveOptions.logger);
    if (cluster.isMaster) {
        require('./cluster-master')(effectiveOptions);
        if (typeof masterFunction === 'function') {
            masterFunction(effectiveOptions);
        }
    } else {
        require('./cluster-worker')(workerFunction, effectiveOptions);
    }
};
clusterStability.processName = processName;
clusterStability.log = log(defaultOptions.logLevel);

export default clusterStability;
