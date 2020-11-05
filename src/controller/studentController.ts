import express, { NextFunction, Request, Response, Router } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import { MongoError } from 'mongodb';
import professorModel from '../schema/professor';
import studentModel, { Student } from '../schema/student';
import validateFn from '../validator/validate';
import { requestLog } from '../winston';

const router: Router = express.Router();

const valueCheck = async (req: Request, res: Response, next: NextFunction) => {
    const name: string = req.query.name as string;
    if (!name) {
        await studentModel.find({}, (err, result) => {
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
    const name = req.query.name;
    const user = await studentModel.aggregate([
        {
            $match: {
                name: name,
            },
        },
    ]);
    res.status(200).send(user);
});

router.post('/', validateFn.typeStudentCheck, validateFn.nameCheck, validateFn.ageCheck, validateFn.phoneCheck, validateFn.sexCheck, validateFn.professorCheck, async (req: Request, res: Response) => {
    const studentData: Student = req.body;

    const professor = await professorModel.findOne({ name: studentData.professor });
    await studentModel
        .create({ ...studentData, professor: professor?.id })
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

    const user = await studentModel.findOne({ name: name });
    if (user) {
        await studentModel.deleteOne({ name: name });
        res.status(200).send('성공적으로 삭제 되었습니다.');
    } else {
        res.status(400).send('해당 유져가 존재하지 않습니다.');
    }
});

router.patch('/', validateFn.nameCheck, validateFn.phoneCheckForUpdate, validateFn.ageCheckForUpdate, validateFn.professorCheckForUpdate, async (req, res) => {
    let { name, age, phone, professor } = req.body;

    const user = await studentModel.findOne({ name });
    if (user) {
        if (!phone) phone = user.phone;
        if (!age) phone = user.phone;
        if (!professor) professor = user.professor;
        if (phone || age || professor) {
            console.log('교수라고 : ', professor);
            if (professor) {
                const professorData = await professorModel.findOne({ name: professor });
                if (!professorData) {
                    res.status(500).send('해당되는 교수 정보가 없습니다.');
                } else {
                    professor = professorData.id;
                }
            }
            await studentModel.updateOne({ _id: user.id }, { phone, age, professor }, (err) => {
                if (err) {
                    requestLog(req);
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
