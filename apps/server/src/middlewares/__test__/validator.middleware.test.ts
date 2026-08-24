import { describe, it, expect } from "vitest";
import { z } from "zod";
import validate from "../validator.middleware.js";

describe("Validator Middleware Basics", () => {
    it("should simply trim the input string", async () => {
        // 1. Define a basic schema that trims the input
        const schema = z.object({
            params: z.object({
                username: z.string().trim() // Zod will trim spaces here
            })
        });

        const middleware = validate(schema);

        // 2. Set up the raw input (with spaces)
        const req: any = {
            body: {},
            query: {},
            params: { username: "    some_user_name    " } // <-- spaces pad the input
        };
        const res: any = {};
        const next: any = () => {}; // empty function

        // 3. Run the validation middleware
        await middleware(req, res, next);

        // 4. Check if the output string is properly trimmed
        expect(req.params.username).toBe("some_user_name"); 
    });
});
