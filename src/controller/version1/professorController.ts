import express, { NextFunction, Request, Response, Router } from 'express';
import { MongoError } from 'mongodb';
import professorModel, { Professor } from '../../schema/professor';
import validateFn from '../../validator/validate';
import { logger, requestLog } from '../../winston';

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
    await professorModel
        .create(professorData)
        .then((result) => {
            logger.info('professor 정보 생성됨');
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
        await professorModel
            .deleteOne({ name: name })
            .then((data) => {
                logger.info(`${name}의 professor정보 삭제됨`);
                res.status(200).send(`professor의 ${name}의 정보가 성공적으로 삭제되었습니다.`);
            })
            .catch((err) => res.status(400).send(err));
    } else {
        res.status(400).send('해당 유져가 존재하지 않습니다.');
    }
});

router.patch('/', validateFn.nameCheck, validateFn.phoneCheckForUpdate, validateFn.ageCheckForUpdate, async (req, res) => {
    let { name, age, phone } = req.body;
    console.log(name, age, phone);
    await professorModel
        .findOne({ name: name })
        .then(async (data) => {
            if (age || phone) {
                if (!age) age = data?.age;
                if (!phone) phone = data?.phone;
                await professorModel
                    .updateOne({ _id: data?.id }, { age, phone })
                    .then((data) => {
                        logger.info(`${name}의 professor정보 수정됨`);
                        res.status(200).send(data);
                    })
                    .catch((err) => {
                        requestLog(req);
                        res.status(500).send(err);
                    });
            } else {
                res.status(400).send('수정할 정보를 입력해 주세요. age와 phone값의 수정이 가능합니다.');
            }
        })
        .catch((err) => res.status(400).send('해당 유져가 존재하지 않습니다.'));
});

router.get('/search', validateFn.nameCheck, validateFn.ageCheck, validateFn.sexCheck, async (req, res) => {
    const { age, name, sex } = req.body;

    await professorModel
        .aggregate([
            {
                $match: {
                    name,
                },
            },
            {
                $lookup: {
                    from: 'students',
                    let: { professorId: '$_id' }, //professor table의 값을 이용해 새로만들 변수명 , professor의 _id값을 professorId값으로 사용
                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$professor', '$$professorId'] }, { $gt: ['$age', age] }, { $eq: ['$sex', sex] }] } } }],
                    as: 'students',
                },
            },
            {
                $addFields: {
                    students: '$students.name',
                },
            },
            {
                $project: { _id: 0, name: 1, students: 1 },
            },
        ])
        .then((data) => {
            if (data.length !== 0) {
                res.status(200).json(data);
            } else {
                res.status(500).send('해당되는 정보가 없습니다.');
            }
        })
        .catch((err) => {
            requestLog(req);
            res.status(500).send(err);
        });

    // const test = await professorModel.aggregate([
    //     { $match: { name } },
    //     {
    //         $lookup: { from: 'students', as: 'students', localField: '_id', foreignField: 'professor' },
    //     },
    //     {
    //         $project: {
    //             name: 1,
    //             students: {
    //                 $filter: {
    //                     input: '$students',
    //                     as: 'students',
    //                     cond: { $and: [{ $gt: ['$$students.age', age] }, { $eq: ['$$students.sex', sex] }] },
    //                 },
    //             },
    //         },
    //     },
    //     {
    //         $project: {
    //             'students.name': 1,
    //             'students.age': 1,
    //             'students.sex': 1,
    //         },
    //     },
    // ]);

    // const test0 = await professorModel.aggregate([
    //     { $match: { name } },
    //     {
    //         $lookup: { from: 'students', as: 'students', localField: '_id', foreignField: 'professor' },
    //     },
    //     {
    //         $unwind: '$students',
    //     },
    //     {
    //         $match: { 'students.age': { $gt: age } },
    //     },
    //     {
    //         $group: {
    //             _id: '$_id',
    //             students: { $push: '$students.name' },
    //         },
    //     },
    // ]);
    //console.log('첫번째 : ', test0)

    // const test1 = await professorModel.aggregate([
    //     { $match: { name } },
    //     {
    //         $lookup: { from: 'students', as: 'students', localField: '_id', foreignField: 'professor' },
    //     },
    //     {
    //         $unwind: '$students',
    //     },
    //     {
    //         $match: { $and: [{ 'students.age': { $gt: age } }, { 'students.sex': { $eq: sex } }] },
    //     },
    //     {
    //         $group: {
    //             _id: '$_id',
    //             professor: { $first: '$name' },
    //             students: { $push: '$students.name' },
    //         },
    //     },
    // ]);
});

export default router;
