import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import ApiError from "../utils/api-errors.js";

const validate = (schema: z.ZodTypeAny) =>
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = await schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            }) as Record<string, any>;

            if ("body" in parsed)   req.body  = (parsed as any).body;
            if ("query" in parsed)  req.query = (parsed as any).query;
            if ("params" in parsed) Object.assign(req.params, (parsed as any).params);

            next();
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                throw new ApiError(
                    400,
                    "Validation failed",
                    error.issues.map((issue) => ({
                        field: issue.path.join("."),
                        message: issue.message,
                    })),
                );
            }

            throw error;
        }
    };

export default validate;