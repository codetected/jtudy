import express, { Response, Request, NextFunction } from 'express';
import helmet from 'helmet';
import version1StudentRouter from './controller/version1/studentController';
import version1ProfessorRouter from './controller/version1/professorController';
import version2StudentRouter from './controller/version2/studentController';
import version2ProfessorRouter from './controller/version2/professorController';
import handleError from './error/error';

import './db';
import { logger } from './winston';

import cluster, { worker } from 'cluster';
const cCPUs = require('os').cpus().length;

const app = express();

const router1 = express.Router();
const router2 = express.Router();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//versioning1
router1.use('/student', version1StudentRouter);
router1.use('/professor', version1ProfessorRouter);
app.use('/v1', router1);

//versioning2
router2.use('/student', version2StudentRouter);
router2.use('/professor', version2ProfessorRouter);
app.use('/v2', router2);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('express server error');
    handleError(err, res);
});

if (cluster.isMaster) {
    const num = 2;
    const count = num ? num : cCPUs;

    for (let i = 0; i < count; i++) {
        cluster.fork();
    }

    cluster.on('online', () => {
        console.log('시작');
    });

    cluster.on('disconnect', () => {
        console.log('disconnect실행');
        cluster.fork();
    });
    cluster.on('exit', (worker, code, signal) => {
        console.log('워커 종료 : ' + worker.id);
        console.log(code);
        if (code == 200) {
            cluster.fork();
        }
        process.exit();
    });
} else {
    app.listen(3000, () => {
        logger.info('Server listening on port 3000');
    });
}
