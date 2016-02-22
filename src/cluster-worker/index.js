import uncaughtExceptionHandler from './uncaught-exception-handler';

export default (workerFunction, options) => {
    const server = workerFunction(options);

    if (options.handleUncaughtException) {
        process.on('uncaughtException', uncaughtExceptionHandler(server, options.log));
    }
};
