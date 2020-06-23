import cluster from 'cluster'
import os from 'os'
import logFactory from './log-factory.mjs'
export { default as processName } from './process-name.mjs'

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

export const log = logFactory(calculateOptions().logLevel)

export default async (workerFunction, options = {}, masterFunction) => {
  if (typeof workerFunction !== 'function') {
    throw new Error('workerFunction must be supplied as the first argument.')
  }
  if (typeof options !== 'object') {
    throw new Error(
      'The second argument, if supplied, must be an options object, null or undefined.'
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
    const clusterMaster = (await import('./cluster-master/index.mjs')).default
    clusterMaster(masterFunction, effectiveOptions)
  } else {
    const clusterWorker = (await import('./cluster-worker/index.mjs')).default
    clusterWorker(workerFunction, effectiveOptions)
  }
}
