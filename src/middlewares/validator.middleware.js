import { validationResult } from "express-validator";
import ApiError from "../utils/api-errors.js"

const validate = (req, res, next) => {
    const error = validationResult(req);
    if (error.isEmpty()) {
        return next();
    }
    const extractedErrors = error.array().map(err => ({
        path: err.path,
        msg: err.msg
    }));

    throw new ApiError(422, `Error: ${extractedErrors[0].msg}`, extractedErrors)
}

export default validate;