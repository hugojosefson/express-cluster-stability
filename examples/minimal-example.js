import express from 'express';
import stabilityCluster from '../lib';

stabilityCluster(() => express().listen(8000));
