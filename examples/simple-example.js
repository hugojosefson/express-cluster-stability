import express from 'express';
import clusterStability from '../lib';

clusterStability(({log}) => {

    const app = express();
    app.get('/', (req, res) => res.send(`Hello world.`));

    return app.listen(8000, () => {
        log(`App ready at http://localhost:8000/`);
    });
});
