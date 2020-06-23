import uncaughtExceptionHandler from './uncaught-exception-handler.mjs'

export default (workerFunction, options) => {
  const serverOrPromise = workerFunction(options)

  if (options.handleUncaughtException) {
    process.on(
      'uncaughtException',
      uncaughtExceptionHandler(options, serverOrPromise)
    )
  }
}
