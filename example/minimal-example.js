import express from 'express';
import stabilityCluster from 'express-stability-cluster';

stabilityCluster(() => express().listen(8000));
