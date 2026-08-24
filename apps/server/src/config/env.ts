import "dotenv/config";

const NODE_ENV: string = process.env.NODE_ENV ?? "development";
const PORT: number = Number(process.env.PORT ?? 3000);
const CORS_ORIGIN: string = process.env.CORS_ORIGIN ?? "";
const CORS_ORIGINS: string[] = CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
const MONGO_URI: string = process.env.MONGO_URI ?? "";

const ACCESS_TOKEN_SECRET: string = process.env.ACCESS_TOKEN_SECRET ?? "";
const ACCESS_TOKEN_EXPIRY: string = process.env.ACCESS_TOKEN_EXPIRY ?? "";
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET ?? "";
const REFRESH_TOKEN_EXPIRY: string = process.env.REFRESH_TOKEN_EXPIRY ?? "";

const GMAIL_CLIENT_ID: string = process.env.GMAIL_CLIENT_ID ?? "";
const GMAIL_CLIENT_SECRET: string = process.env.GMAIL_CLIENT_SECRET ?? "";
const GMAIL_REFRESH_TOKEN: string = process.env.GMAIL_REFRESH_TOKEN ?? "";
const GMAIL_USER_EMAIL: string = process.env.GMAIL_USER_EMAIL ?? "";
const EMAIL_VERIFICATION_URL: string = process.env.EMAIL_VERIFICATION_URL ?? "";
const FORGOT_PASSWORD_URL: string = process.env.FORGOT_PASSWORD_URL ?? "";

const IMAGEKIT_PRIVATE_KEY: string = process.env.IMAGEKIT_PRIVATE_KEY ?? "";
const IMAGEKIT_URL_ENDPOINT: string = process.env.IMAGEKIT_URL_ENDPOINT ?? "";

const SERVER_URL: string = process.env.SERVER_URL ?? "";

const requiredEnvs: Array<[string, string]> = [
    ["CORS_ORIGIN", CORS_ORIGIN],
    ["MONGO_URI", MONGO_URI],
    ["ACCESS_TOKEN_SECRET", ACCESS_TOKEN_SECRET],
    ["ACCESS_TOKEN_EXPIRY", ACCESS_TOKEN_EXPIRY],
    ["REFRESH_TOKEN_SECRET", REFRESH_TOKEN_SECRET],
    ["REFRESH_TOKEN_EXPIRY", REFRESH_TOKEN_EXPIRY],
    ["GMAIL_CLIENT_ID", GMAIL_CLIENT_ID],
    ["GMAIL_CLIENT_SECRET", GMAIL_CLIENT_SECRET],
    ["GMAIL_REFRESH_TOKEN", GMAIL_REFRESH_TOKEN],
    ["EMAIL_VERIFICATION_URL", EMAIL_VERIFICATION_URL],
    ["FORGOT_PASSWORD_URL", FORGOT_PASSWORD_URL],
    ["IMAGEKIT_PRIVATE_KEY", IMAGEKIT_PRIVATE_KEY],
    ["IMAGEKIT_URL_ENDPOINT", IMAGEKIT_URL_ENDPOINT],
];

for (const [name, value] of requiredEnvs) {
    if (!value || value.trim() === "") {
        throw new Error(`[env] Missing required environment variable: ${name}`);
    }
}

if (!Number.isFinite(PORT)) {
    throw new Error("[env] PORT must be a valid number");
}

if (CORS_ORIGINS.length === 0) {
    throw new Error("[env] CORS_ORIGIN must include at least one valid origin");
}

export const env = {
    NODE_ENV,
    PORT,
    CORS_ORIGIN,
    CORS_ORIGINS,
    MONGO_URI,
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN,
    GMAIL_USER_EMAIL,
    EMAIL_VERIFICATION_URL,
    FORGOT_PASSWORD_URL,
    IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT,
    SERVER_URL,
} as const;

export default env;