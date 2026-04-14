type AsyncRouteHandler = (
    req: any,
    res: any,
    next: any,
) => Promise<unknown> | unknown;

const asyncHandler = (fn: AsyncRouteHandler) => {
    return async (req: any, res: any, next: any): Promise<void> => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

export default asyncHandler;