/* eslint-env mocha */

import assert from 'assert'
import clusterStability from '../src/index.mjs'

describe('clusterStability', () => {
  it('is a function', () => {
    assert.deepStrictEqual(typeof clusterStability, 'function')
  })
})
