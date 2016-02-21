# express-stability-cluster

Stability and multi-core performance for your Express app, via the built-in stable Node.js
[cluster](https://nodejs.org/api/cluster.html#cluster_cluster) API.

This module is configurable, and has sane defaults for running your Express app stable and
fast.

## Prerequisites

* Node.js 4 LTS or later; install via
  [nvm](https://github.com/hugojosefson/ubuntu-install-scripts/blob/ubuntu-gnome-15.10/install-nvm-and-nodejs).

## Install

```bash
npm install --save express-stability-cluster
```

## Usage

Call this module with a `workerFunction`. Make sure to do all the work inside the worker function, so the master doesn't
waste any time on things the workers will do.

### Examples

Minimal noop example.

```js
import express from 'express';
import stabilityCluster from 'express-stability-cluster';

stabilityCluster(() => express().listen(8000));
```

Fully functional example, with simple logging in each worker.

```js
import express from 'express';
import stabilityCluster from 'express-stability-cluster';

stabilityCluster(({log}) => {

    const app = express();
    app.get('/', (req, res) => res.send(`Hello world.`));

    return app.listen(8000, () => {
        log(`App ready at http://localhost:8000/`);
    });
});
```

## API

The module `express-stability-cluster` is a function which takes two arguments:

  * `workerFunction` - Mandatory. Function which will be run in each worker process. Receives the
     effective options object as an argument, and MUST return a server with a `.close()` method.
  * `options` - Optional. Object with configuration options to override:
    * `logLevel` - Minimum log level to process. Default is environment variable
       `EXPRESS_CLUSTER_NUMBER_OF_WORKERS`, or `info`.
    * `numberOfWorkers` - How many worker processes to spin up. Default is environment variable
       `EXPRESS_CLUSTER_NUMBER_OF_WORKERS`, or the number of CPU cores on the server.
    * `handleUncaughtException` - Whether to handle `uncaughtexception` in the workers, disconnect
       it, spin up a new worker in its place, and close the crashing one as cleanly as possible,
       killing it after `workerKillTimeout` ms if needed. Default is environment variable
       `EXPRESS_CLUSTER_HANDLE_UNCAUGHT_EXCEPTION`, or `true`.
    * `workerKillTimeout` - How long in ms after trying to shut down a worker nicely, to kill it.
       Default is environment variable `EXPRESS_CLUSTER_WORKER_KILL_TIMEOUT`, or `30000` (ms).
    * `logger` - Function which takes a level string as argument, and returns a function which logs
      `message` and any extra arguments to that level. Default is a function which uses
      `console.log` and `console.error`; see *Full config options example* below.

The `workerFunction` will be called with the effective options used, as one argument. That object will
also have a property `log`, which uses `logger` to log messages. `log` is an object with one property
(function) for each possible log level. These are:

```js
log.fatal(message, ...rest);
log.error(message, ...rest);
log.warn(message, ...rest);
log.info(message, ...rest);
log.debug(message, ...rest);
log.trace(message, ...rest);
```

`log()` itself is also a function, aliased to `log.info()`.

Each log function also has a boolean property which tells you if that specific log level is enabled
based on the config option `logLevel`. It can be useful, when you want to skip processing what to
log entirely if the level is not relevant. For example:

```js
if (log.debug.enabled) {
  log.debug(calculateExpensivelyWhatToLog(req, res));
}
```

## Full config options example

All configuration options expanded to their default values.

We also show how to use the `cluster` module directly to access the worker, and output its `id` as
part of the web app response to a client. The string `Worker ${cluster.worker.id}` (or `Master`
when applicable) is also available from the exported `processName` in `express-stability-cluster`.

`logger` is a function which takes a level string as argument, and returns a function which logs
`message` and any extra arguments to that level. The default implementation is shown in this exampe.

```js
import express from 'express';
import stabilityCluster from 'express-stability-cluster';

import cluster from 'cluster';
import os from 'os';
import {processName} from 'express-stability-cluster';

stabilityCluster(({log}) => {
    log(`Reporting for duty.`);

    const app = express();
    app.get('/', (req, res) => res.send(`Hello world. This is worker ${cluster.worker.id}.\n`));

    const port = process.env.PORT || 8000;
    return app.listen(port, () => {
        log(`App ready at http://localhost${port === 80 ? '' : `:${port}`}/`);
    });
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
```
