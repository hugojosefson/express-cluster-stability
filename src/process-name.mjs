import cluster from 'cluster'

export default cluster.isWorker ? `Worker ${cluster.worker.id}` : `Master`
