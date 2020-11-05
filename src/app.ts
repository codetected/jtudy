import express, { Response, Request, NextFunction } from 'express';
import helmet from 'helmet';
import studentRouter from './controller/studentController';
import professorRouter from './controller/professorController';
import handleError from './error/error';

import './db';
import { logger } from './winston';

const app = express();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/student', studentRouter);
app.use('/professor', professorRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('express server error');
    handleError(err, res);
});

app.listen(3000, () => {
    logger.info('Server listening on port 3000');
});
