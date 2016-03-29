# Changelog for `express-cluster-stability`

## v1.4.1

  * **Fix:** Handle Promise rejection from master function; quit with exit code 1.
  * **Fix:** Load environment variables on use, rather than on load. Allows using
  [dotenv](https://www.npmjs.com/package/dotenv) for configuration.

## v1.4.0

  * **Feature:** Allow `workerFunction` to return `Promise` for server.
  * **Feature:** Allow `masterFunction` to return `Promise`, to delay initial workers.
  * **Fix:** The server closing fast is not an error.
  * **Docs:** Correct `logLevel` env variable.

## v1.3.2

  * **Misc:** Enforce correct argument types.

## v1.3.1

  * **Fix:** `workerFunction` is not required to return a server.

## v1.3.0

  * **Feature:** Accept optional `masterFunction` as third argument.
  * **Misc:** Print `logLevel` before `processName` in default logger.

## v1.2.1

  * **Docs:** Encourage starring in `README.md`.

## v1.2.0

  * **Feature:** Add extra export `log`.
  * **Docs:** Document `processName` and `log` in `README.md`.

## v1.1.2

  * **Docs:** Add `workerRespawnDelay` and `workerKillTimeout` to full example.

## v1.1.1

  * **Docs:** Add this `CHANGELOG.md`.

## v1.1.0

  * **Feature:** Don't spawn workers too fast.

## v1.0.0

  * First official release.

