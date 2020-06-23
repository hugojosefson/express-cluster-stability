import cluster from 'cluster'
import os from 'os'

import processName from './process-name.mjs'
import logFactory from './log-factory.mjs'

const calculateOptions = options => ({
  numberOfWorkers:
    process.env.EXPRESS_CLUSTER_NUMBER_OF_WORKERS || os.cpus().length,
  handleUncaughtException:
    process.env.EXPRESS_CLUSTER_HANDLE_UNCAUGHT_EXCEPTION !== 'false',
  workerRespawnDelay: process.env.EXPRESS_CLUSTER_WORKER_RESPAWN_DELAY || 1000,
  workerKillTimeout: process.env.EXPRESS_CLUSTER_WORKER_KILL_TIMEOUT || 30000,
  logLevel: process.env.EXPRESS_CLUSTER_LOG_LEVEL || 'info',
  ...options,
})

export { processName }
export const log = logFactory(calculateOptions().logLevel)

export default (workerFunction, options = {}, masterFunction) => {
  if (typeof workerFunction !== 'function') {
    throw new Error('workerFunction must be supplied as the first argument.')
  }
  if (typeof options !== 'object') {
    throw new Error(
      'The second argument, if supplied, must be an options object or null.'
    )
  } else if (
    options !== null &&
    typeof options === 'object' &&
    typeof options.length !== 'undefined'
  ) {
    throw new Error(
      'The second argument, if supplied, must be an options object or null.'
    )
  }
  if (
    typeof masterFunction !== 'undefined' &&
    typeof masterFunction !== 'function'
  ) {
    throw new Error(
      'The third argument, if supplied, must be the masterFunction.'
    )
  }

  const effectiveOptions = calculateOptions(options)
  effectiveOptions.log = logFactory(
    effectiveOptions.logLevel,
    effectiveOptions.logger
  )
  if (cluster.isMaster) {
    import('./cluster-master/index.mjs').then(({ default: clusterMaster }) =>
      clusterMaster(masterFunction, effectiveOptions)
    )
  } else {
    import('./cluster-worker/index.mjs').then(({ default: clusterWorker }) =>
      clusterWorker(workerFunction, effectiveOptions)
    )
  }
}
