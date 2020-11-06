import { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { logger, requestLog } from '../winston';

const typeProfessorCheck = async (req: Request, res: Response, next: NextFunction) => {
    await check('type').notEmpty().bail().equals('professor').withMessage('professor의 값만 가능합니다.').bail().withMessage('type이 professor여야만 합니다.').run(req);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        requestLog(req);
        return res.status(422).json({ errors: error });
    }
    next();
};

const typeStudentCheck = async (req: Request, res: Response, next: NextFunction) => {
    await check('type').notEmpty().bail().equals('student').withMessage('student의 값만 가능합니다.').bail().withMessage('type이 student여야만 합니다.').run(req);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        requestLog(req);
        return res.status(422).json({ errors: error });
    }
    next();
};

const nameCheck = async (req: Request, res: Response, next: NextFunction) => {
    await check('name', 'name으로 넘어온 값이 없습니다.')
        .notEmpty()
        .bail()
        .isString()
        .not()
        .isNumeric()
        .withMessage('name은 숫자일 수 없습니다.')
        .bail()
        .isLength({ min: 1, max: 10 })
        .bail()
        .withMessage('이름이 잘못 되었습니다.')
        .run(req);

    const error = validationResult(req);
    if (!error.isEmpty()) {
        requestLog(req);
        res.status(422).json({ errors: error });
    } else {
        next();
    }
};
const ageCheck = async (req: Request, res: Response, next: NextFunction) => {
    await check('age', 'age로 넘어온 값이 없습니다.')
        .notEmpty()
        .isNumeric()
        .withMessage('값은 숫자여야만 합니다.')
        .bail()
        .isInt({ min: 18, max: 99 })
        .withMessage('age가 잘못 입력 되었습니다. age의 값은 18 ~ 100 사이의 값만 유효합니다.')
        .run(req);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        requestLog(req);
        return res.status(422).json({ errors: error });
    }
    next();
};
const phoneCheck = async (req: Request, res: Response, next: NextFunction) => {
    await check('phone')
        .notEmpty()
        .withMessage('phone으로 넘어온 값이 없습니다.')
        .bail()
        .isString()
        .isNumeric()
        .withMessage('phone의 값은 숫자로, 타이푼 없이 작성해 주세요.')
        .bail()
        .isLength({ min: 10, max: 11 })
        .withMessage('전화번호의 형식이 다릅니다. 10 ~ 11개의 숫자만 유효합니다.')
        .run(req);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        requestLog(req);
        return res.status(422).json({ errors: error });
    }
    next();
};

const sexCheck = async (req: Request, res: Response, next: NextFunction) => {
    await check('sex', 'sex 값이 없습니다.')
        .isString()
        .not()
        .isNumeric()
        .isLength({ max: 2 })
        .withMessage('올바른 sex값이 아닙니다. 문자열만 가능합니다.')
        .bail()
        .isIn(['남', '여'])
        .withMessage('남 혹은 여 의 값만 가능합니다')
        .bail()
        .run(req);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        requestLog(req);
        return res.status(422).json({ errors: error });
    }
    next();
};

const professorCheck = async (req: Request, res: Response, next: NextFunction) => {
    await check('professor', 'professor의 값이 없습니다.')
        .isString()
        .not()
        .isNumeric()
        .isLength({ min: 1, max: 10 })
        .withMessage('올바른 professor값이 아닙니다. 문자열만 가능합니다.')
        .bail()
        .run(req);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        requestLog(req);
        return res.status(422).json({ errors: error });
    }
    next();
};

const phoneCheckForUpdate = async (req: Request, res: Response, next: NextFunction) => {
    await check('phone')
        .if(check('phone').exists())
        .isNumeric()
        .withMessage('phone의 값은 숫자로, 타이푼 없이 작성해 주세요.')
        .isLength({ min: 10, max: 11 })
        .withMessage('전화번호의 형식이 다릅니다. 10 ~ 11개의 숫자만 유효합니다.')
        .run(req);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        requestLog(req);
        return res.status(422).json({ errors: error });
    }
    next();
};

const ageCheckForUpdate = async (req: Request, res: Response, next: NextFunction) => {
    await check('age')
        .if(check('age').exists())
        .isNumeric()
        .withMessage('age 값은 숫자여야만 합니다.')
        .isInt({ min: 18, max: 99 })
        .withMessage('age가 잘못 입력 되었습니다. age의 값은 18 ~ 100 사이의 값만 유효합니다.')
        .run(req);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        requestLog(req);
        return res.status(422).json({ errors: error });
    }
    next();
};

const professorCheckForUpdate = async (req: Request, res: Response, next: NextFunction) => {
    await check('professor')
        .if(check('professor').exists())
        .isString()
        .withMessage('professor 값은 문자열이어야만 합니다.')
        .isLength({ min: 1, max: 10 })
        .withMessage('professor값이 잘못 입력 되었습니다. professor의 값은 1 ~ 10 사이의 값만 유효합니다.')
        .run(req);
    const error = validationResult(req);
    if (!error.isEmpty()) {
        requestLog(req);
        return res.status(422).json({ errors: error });
    }
    next();
};

export default { typeProfessorCheck, typeStudentCheck, nameCheck, ageCheck, phoneCheck, phoneCheckForUpdate, sexCheck, ageCheckForUpdate, professorCheck, professorCheckForUpdate };
