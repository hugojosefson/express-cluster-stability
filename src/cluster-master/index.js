import cluster from 'cluster';
import queueFactory from './queue-factory';

export default (masterFunction, options) => {
    const {numberOfWorkers, workerRespawnDelay, workerKillTimeout, log} = options;

    const queue = queueFactory(workerRespawnDelay);

    /**
     * worker.id -> timeout id for killing it
     */
    const crashingWorkers = new Map();

    const messageHandler = worker => message => {
        log.debug(`message "${message}" from worker ${worker.id}`);
        if (message === 'crashing') {
            log.warn(`Worker ${worker.id} with PID ${worker.process.pid} is crashing. Disconnecting it...`);
            crashingWorkers.set(worker.id, setTimeout(() => {
                log.warn(`Worker ${worker.id} with PID ${worker.process.pid} hasn't disconnected after ${workerKillTimeout} ms. Killing it...`);
                worker.kill();
            }, workerKillTimeout));
            worker.disconnect();
            forkNewWorker();
        }
    };

    const forkNewWorker = () => queue.push(forkNewWorkerNow);
    const forkNewWorkerNow = () => {
        log('Forking a new worker...');
        const worker = cluster.fork();
        worker.on('message', messageHandler(worker));
    };

    cluster.on('disconnect', worker => {
        log(`Worker ${worker.id} with PID ${worker.process.pid} disconnected.`);
    });

    cluster.on('exit', (worker, code, signal) => {
        log(`Worker ${worker.id} with PID ${worker.process.pid} exited with code ${code} because of signal ${signal}`);
        if (crashingWorkers.has(worker.id)) {
            clearTimeout(crashingWorkers.get(worker.id));
            crashingWorkers.delete(worker.id);
            // already forked when putting it in crashingWorkers, so not forking another one.
        } else {
            forkNewWorker();
        }
    });

    const forkInitialWorkers = () => {
        for (var i = 0; i < numberOfWorkers; i++) {
            forkNewWorkerNow();
        }
    };

    if (typeof masterFunction === 'function') {
        const masterResult = masterFunction(options);
        if (masterResult && typeof masterResult.then === 'function') {
            masterResult
                .then(forkInitialWorkers)
                .catch(reason => {
                    log.fatal(reason);
                    process.exit(1);
                });
        } else {
            forkInitialWorkers();
        }
    } else {
        forkInitialWorkers();
    }

};
