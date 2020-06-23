import express from 'express'
import clusterStability from '../src/index.mjs'

clusterStability(() => express().listen(8000))
