import express, { NextFunction, Request, Response, Router } from 'express';
import { Result, validationResult } from 'express-validator';
import { ValidationError } from 'express-validator/src/base';
import { MongoError } from 'mongodb';
import professorModel, { Professor } from '../schema/professor';
import validateFn from '../validator/validate';
import { requestLog } from '../winston';

const router: Router = express.Router();

const valueCheck = async (req: Request, res: Response, next: NextFunction) => {
    const name = req.query.name as string;
    if (!name) {
        await professorModel.find({}, (err, result) => {
            if (err) {
                requestLog(req);
                res.status(500).json('DB로부터 값을 가져오는 도중 에러가 발생 하였습니다.');
            } else {
                res.status(200).json(result);
            }
        });
    } else {
        next();
    }
};

router.get('/', valueCheck, validateFn.nameCheck, async (req: Request, res: Response) => {
    const name: string = req.query.name as string;
    await professorModel
        .aggregate([
            {
                $match: {
                    name: name,
                },
            },
        ])
        .then((data) => res.status(200).send(data))
        .catch((err) => {
            requestLog(req);
            res.status(500).send(err);
        });
});

router.post('/', validateFn.typeProfessorCheck, validateFn.nameCheck, validateFn.ageCheck, validateFn.phoneCheck, async (req: Request, res: Response, next: NextFunction) => {
    const professorData: Professor = req.body;
    console.log('실행됨');
    await professorModel
        .create(professorData)
        .then((result) => {
            res.status(201).json(result);
        })
        .catch((error: MongoError) => {
            if (error) {
                requestLog(req);
                res.status(500).json(error);
            }
        });
});

router.delete('/', validateFn.nameCheck, async (req, res) => {
    const name = req.query.name as string;

    const user = await professorModel.findOne({ name: name });
    if (user) {
        await professorModel.deleteOne({ name: name });
        res.status(200).send('성공적으로 삭제 되었습니다.');
    } else {
        res.status(400).send('해당 유져가 존재하지 않습니다.');
    }
});

router.patch('/', validateFn.nameCheck, validateFn.phoneCheckForUpdate, validateFn.ageCheckForUpdate, async (req, res) => {
    let { name, age, phone } = req.body;

    const user: Professor | null = await professorModel.findOne({ name: name });
    if (user) {
        if (!age) age = user.age;
        if (!phone) phone = user.phone;
        if (age || phone) {
            await professorModel.updateOne({ _id: user.id }, { age, phone }, (err) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send('수정완료 되었습니다.');
                }
            });
        } else {
            res.status(400).send('수정할 정보를 입력해 주세요. age와 phone값의 수정이 가능합니다.');
        }
    } else {
        res.status(400).send('해당 유져가 존재하지 않습니다.');
    }
});

export default router;
