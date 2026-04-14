import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import ApiError from "../utils/api-errors.js";

const validate = (schema: z.ZodTypeAny) =>
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            if (
                typeof parsed === "object" &&
                parsed !== null &&
                "body" in parsed
            ) {
                req.body = (parsed as { body: unknown }).body;
            }

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