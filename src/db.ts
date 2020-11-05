import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.NODE_ENV === 'prod' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_LOCAL;
mongoose
    .connect(uri as string, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log('MongoDB 연결 성공'))
    .catch((error) => console.log('MongoDB 연결 실패 : ', error));
const db = mongoose.connection;
db.on('connected', () => console.log('몽고 연결 성공'));
db.on('error', (err) => console.log('몽고 에러 : ', err));
db.on('disconnected', () => console.log('몽고 연결 끊어짐'));
