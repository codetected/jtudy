import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from './winston';
dotenv.config();

const uri = process.env.NODE_ENV === 'prod' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_LOCAL;
mongoose
    .connect(uri as string, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => logger.info('connection succeeded to mongodb'))
    .catch((error) => console.log('MongoDB 연결 실패 : ', error));
const db = mongoose.connection;
db.on('connected', () => logger.info('mongodb connected'));
db.on('error', (err) => logger.error(`mongodb error with ${err}`));
db.on('disconnected', () => logger.info('mongodb disconnected'));
