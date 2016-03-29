import cluster from 'cluster';
import os from 'os';

import processName from './process-name';
import log from './log-factory';

const calculateOptions = options => Object.assign({
    numberOfWorkers: process.env.EXPRESS_CLUSTER_NUMBER_OF_WORKERS || os.cpus().length,
    handleUncaughtException: process.env.EXPRESS_CLUSTER_HANDLE_UNCAUGHT_EXCEPTION !== 'false',
    workerRespawnDelay: process.env.EXPRESS_CLUSTER_WORKER_RESPAWN_DELAY || 1000,
    workerKillTimeout: process.env.EXPRESS_CLUSTER_WORKER_KILL_TIMEOUT || 30000,
    logLevel: process.env.EXPRESS_CLUSTER_LOG_LEVEL || 'info'
}, options);

const clusterStability = (workerFunction, options = {}, masterFunction) => {
    if (typeof workerFunction !== 'function') {
        throw new Error('workerFunction must be supplied as the first argument.');
    }
    if (typeof options !== 'object') {
        throw new Error('The second argument, if supplied, must be an options object or null.');
    } else if (options !== null && typeof options === 'object' && typeof options.length !== 'undefined') {
        throw new Error('The second argument, if supplied, must be an options object or null.');
    }
    if (typeof masterFunction !== 'undefined' && typeof masterFunction !== 'function') {
        throw new Error('The third argument, if supplied, must be the masterFunction.');
    }

    const effectiveOptions = calculateOptions(options);
    effectiveOptions.log = log(effectiveOptions.logLevel, effectiveOptions.logger);
    if (cluster.isMaster) {
        require('./cluster-master')(masterFunction, effectiveOptions);
    } else {
        require('./cluster-worker')(workerFunction, effectiveOptions);
    }
};
clusterStability.processName = processName;
clusterStability.log = log(calculateOptions().logLevel);

export default clusterStability;
