import os from 'os'
import cluster from 'cluster'
import express from 'express'
import clusterStability, { processName } from '../src/index.mjs'

clusterStability(
  ({ log }) => {
    log(`Reporting for duty.`)

    const app = express()
    app.get('/', (req, res) =>
      res.send(`Hello world. This is worker ${cluster.worker.id}.\n`)
    )
    app.get('/crash', () => setTimeout(() => crashOnPurposeAsdasd(), 1))

    const port = process.env.PORT || 8000
    return app.listen(port, () => {
      log(`App ready at http://localhost${port === 80 ? '' : `:${port}`}/`)
    })
  },
  {
    numberOfWorkers: os.cpus().length, //       this is the default
    handleUncaughtException: true, //           this is the default
    workerRespawnDelay: 1000, //                this is the default
    workerKillTimeout: 30000, //                this is the default
    logLevel: 'info', //                        this is the default
    logger: level => (message, ...rest) => {
      // this is the default
      if (['fatal', 'error', 'warn'].includes(level.toLowerCase())) {
        console.error(
          `${level.toUpperCase()}: ${processName}: ${message}`,
          ...rest
        )
      } else {
        console.log(
          `${level.toUpperCase()}: ${processName}: ${message}`,
          ...rest
        )
      }
    },
  },
  ({ log }) => {
    log(`Doing some extra master work, only in the master process...`)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        log(`...before workers are allowed to start forking.`)
        resolve()
      }, 3000)
    })
  }
)
