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

    throw new ApiError(422, "Received data is not valid", extractedErrors)
}

export default validate;