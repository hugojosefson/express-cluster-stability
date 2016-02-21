import express from 'express';
import stabilityCluster from 'express-stability-cluster';

import cluster from 'cluster';
import os from 'os';
import {processName} from 'express-stability-cluster';

const app = express();
app.get('/', (req, res) => res.send(`Hello world. This is worker ${cluster.worker.id}.\n`));

stabilityCluster(({log}) => {
    log(`Reporting for duty.`);
    return app.listen(8000, () => log(`App ready at http://localhost:8000/`));
}, {
    numberOfWorkers: os.cpus().length,        // this is the default
    handleUncaughtException: true,            // this is the default
    logLevel: 'info',                         // this is the default
    logger: level => (message, ...rest) => {  // this is the default
        if (['fatal', 'error', 'warn'].includes(level.toLowerCase())) {
            console.error(`${processName}: ${level.toUpperCase()}: ${message}`, ...rest);
        } else {
            console.log(`${processName}: ${level.toUpperCase()}: ${message}`, ...rest);
        }
    }
});
