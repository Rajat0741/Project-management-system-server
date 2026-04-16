import type { NextFunction, Request, Response } from "express";

type AsyncRouteHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<unknown> | unknown;

const asyncHandler = (fn: AsyncRouteHandler) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

export default asyncHandler;