import { Response } from 'express';

const handleError = (err: Error, res: Response) => {
    console.log('에러 : ', err.message);
};

export default handleError;
