import cluster from 'cluster'
import closeServerOrKillProcess from './close-server-or-kill-process.mjs'

export default (options, serverOrPromise) => {
  const { log } = options
  let isAlreadyCrashing = false
  let server

  if (serverOrPromise && typeof serverOrPromise.then === 'function') {
    serverOrPromise.then(actualServer => {
      if (isAlreadyCrashing) {
        closeServerOrKillProcess(options, actualServer)
      } else {
        server = actualServer
      }
    })
  } else {
    server = serverOrPromise
  }

  return err => {
    process.send('crashing')
    cluster.worker.disconnect()
    log.fatal('uncaughtException', err)
    isAlreadyCrashing = true
    closeServerOrKillProcess(options, server)
  }
}
