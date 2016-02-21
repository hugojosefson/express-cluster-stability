import express from 'express';
import stabilityCluster from 'express-stability-cluster';

const app = express();
app.get('/', (req, res) => res.send(`Hello world.`));

stabilityCluster(({log}) => app.listen(8000, () => log(`App ready at http://localhost:8000/`)));
