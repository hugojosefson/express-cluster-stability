import express from 'express';
import clusterStability from '../lib';

clusterStability(() => express().listen(8000));
