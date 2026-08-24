import mongoose from "mongoose";
import { env } from "../config/env.js";

const connectDB = async ()=>{
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.log(`MongoDB Connection Error:${error}`);
        process.exit();
    }
}

export default connectDB;