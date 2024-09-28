// src/routes/authRoutes.ts
import express from 'express';
import { registerPatient, registerDoctor, loginUser } from '../controllers/authController';

const authRoutes = express.Router();

authRoutes.post('/patient/register', registerPatient);
authRoutes.post('/doctor/register', registerDoctor);
authRoutes.post('/login', loginUser);

export default authRoutes;
