import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).send('version2 /professor의 get요청에 대한 응답입니다.');
});

router.post('/', (req: Request, res: Response) => {
    res.status(200).send('version2 /professor의 post요청에 대한 응답입니다.');
});

router.patch('/', (req: Request, res: Response) => {
    res.status(200).send('version2 /professor의 patch요청에 대한 응답입니다.');
});

router.delete('/', (req: Request, res: Response) => {
    res.status(200).send('version2 /professor의 delete요청에 대한 응답입니다.');
});

export default router;
