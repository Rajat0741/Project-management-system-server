import express from "express"
import cors from "cors";

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

// basic configuration 
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"));

//Import Routes
import healthCheckRouter from "./routes/healthcheck.routes.js"

app.use("/api/v1/healthCheck",healthCheckRouter)

app.get("/", (req, res) => {
    res.send("Initialization succeeded")
})

export default app;