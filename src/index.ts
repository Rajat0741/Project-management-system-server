import app from "./app.js";
import { env } from "./config/env.js";
import connectDB from "./db/index.js";

const port = env.PORT;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });