import express  from "express";
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import connectDB from "./data/Database.ts"; 
import authRoutes from "./routes/auth.ts";
import adminRoutes from "./routes/Admin.ts"

dotenv.config();

const app = express();
// use to give json output data of get and post request.
app.use(cookieParser());
app.use(express.json());
connectDB();
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

export default app;