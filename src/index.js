import cluster from 'cluster';
import os from 'os';

import log from './log-factory';

import processName_ from './process-name';
export const processName = processName_;

const defaultOptions = {
    numberOfWorkers: process.env.EXPRESS_CLUSTER_NUMBER_OF_WORKERS || os.cpus().length,
    handleUncaughtException: process.env.EXPRESS_CLUSTER_HANDLE_UNCAUGHT_EXCEPTION !== 'false',
    workerKillTimeout: process.env.EXPRESS_CLUSTER_WORKER_KILL_TIMEOUT || 30000,
    logLevel: process.env.EXPRESS_CLUSTER_LOG_LEVEL || 'info'
};

export default (workerFunction, options = {}) => {
    if (typeof workerFunction !== 'function') {
        throw new Error('workerFunction must be supplied.');
    }

    const effectiveOptions = Object.assign({}, defaultOptions, options);
    effectiveOptions.log = log(effectiveOptions.logger);
    if (cluster.isMaster) {
        require('./cluster-master')(effectiveOptions);
    } else {
        require('./cluster-worker')(workerFunction, effectiveOptions);
    }
};
