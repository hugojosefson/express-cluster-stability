export default workerRespawnDelay => {
    const queue = [];
    let timeout;

    const startIfNotAlreadyStarted = () => {
        if (!timeout && queue.length) {
            timeout = setTimeout(processQueue, workerRespawnDelay);
        }
    };

    const processQueue = () => {
        timeout = null;
        if (queue.length) {
            const job = queue.shift();
            if (typeof job === 'function') {
                job();
            }
        }
        startIfNotAlreadyStarted();
    };

    return {
        push: job => {
            queue.push(job);
            startIfNotAlreadyStarted();
        }
    };
};
