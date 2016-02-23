import processName from './process-name';

const levels = {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10
};

const noop = Object.assign(() => {
}, {enabled: false});

const atLeast = (min, level, fn) => levels[level] >= levels[min] ? Object.assign(fn, {enabled: true}) : noop;

const defaultLogger = level => (message, ...rest) => {
    if (['fatal', 'error', 'warn'].includes(level.toLowerCase())) {
        console.error(`${level.toUpperCase()}: ${processName}: ${message}`, ...rest);
    } else {
        console.log(`${level.toUpperCase()}: ${processName}: ${message}`, ...rest);
    }
};

export default (logLevel, logger = defaultLogger) => {
    const log = atLeast(logLevel, 'info', logger('info'));
    log.info = atLeast(logLevel, 'info', logger('info'));
    log.debug = atLeast(logLevel, 'debug', logger('debug'));
    log.trace = atLeast(logLevel, 'trace', logger('trace'));
    log.fatal = atLeast(logLevel, 'fatal', logger('fatal'));
    log.warn = atLeast(logLevel, 'warn', logger('warn'));
    log.error = atLeast(logLevel, 'error', logger('error'));

    return log;
};
