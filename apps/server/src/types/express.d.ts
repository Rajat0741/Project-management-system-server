import type { IUser } from "../models/user.models.js";

/**
 * Interface for authenticated user added to the request object via verifyJWT middleware.
 * Note: Some Optional Properties like password, refreshToken, forgotPasswordToken, etc., are explicitly
 * removed from the user object in the middleware.
 */
interface AuthenticatedUser extends IUser {
    role?: string;
}

declare global {
    namespace Express {
        interface Request {
            /**
             * The authenticated user object, populated by the verifyJWT middleware.
             * Some properties from IUser (e.g., password, tokens) are excluded.
             */
            user: AuthenticatedUser;
        }
    }
}

export {};
