import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./utils/api-errors.js";

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

// basic configuration 
app.use(cookieParser())
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"));

//Import Routes
import healthCheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/project.routes.js"
import taskRouter from "./routes/task.routes.js"
import noteRouter from "./routes/note.routes.js"

app.use("/api/v1/healthCheck",healthCheckRouter)
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/notes", noteRouter);


app.get("/", (req, res) => {
    res.send("Initialization succeeded")
})

app.use((req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
})

export default app;