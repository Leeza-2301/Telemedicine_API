// import express  from "express";
// import dotenv from 'dotenv'
// import cookieParser from 'cookie-parser';
// import connectDB from "./data/Database.ts"; 
// import authRoutes from "./routes/authRoutes.ts";
// import adminRoutes from "./routes/adminRoutes.ts"

// dotenv.config();

// const app = express();
// // use to give json output data of get and post request.
// app.use(cookieParser());
// app.use(express.json());
// connectDB();
// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);

// export default app;


import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // Add this
import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import doctorRoutes from './routes/doctorRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser()); // Add this

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);

export default app;
