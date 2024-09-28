import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Patient,IPatient } from "../models/Patient.ts"; // Adjust the import path as necessary
import { Doctor,IDoctor } from "../models/Doctor"; // Adjust the import path as necessary
import { Admin,IAdmin } from "../models/Admin"; // Adjust the import path as necessary
import { createToken } from "../utils/token.ts"; // Adjust the import path as necessary
import { Model, Document } from "mongoose";


// Patient registration
export const registerPatient = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newPatient = new Patient({ name, email, password: hashedPassword });
        await newPatient.save();
        const token = createToken(newPatient._id, 'patient');
        if (!token) {
            return res.status(500).json({ message: 'Failed to create token' });
        }
        res.status(201).json({ token });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(400).json({ message: 'Error registering patient' });
    }
};

// Doctor registration
export const registerDoctor = async (req: Request, res: Response) => {
    const { name, email, password, specialization } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newDoctor = new Doctor({ name, email, password: hashedPassword, specialization });
        await newDoctor.save();
        const token = createToken(newDoctor._id, 'doctor');
        res.status(201).json({ token });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(400).json({ message: 'Error registering doctor' });
    }
};


export const loginUser = async (req: Request, res: Response) => {

    // Determine the correct model based on the role
    const {role} = req.body;
    if (role === 'patient') {
        loginPatient(Patient,req,res);
    } else if (role === 'doctor') {
        loginDoctor(Doctor,req,res);
    } else if (role === 'admin') {
        loginAdmin(Admin,req,res);
    } else {
        return res.status(400).json({ message: 'Invalid role' });
    }
};


const loginPatient = async (Patient: Model<IPatient, {}, {}, {}, Document<unknown, {}, IPatient> & IPatient & Required<{ _id: unknown; }>, any>, req : Request, res : Response) => {
    const { name, email, password } = req.body;
    try {
        const user = await Patient.findOne({
            $or: [{ email }, { name }] 
        }).exec();

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = createToken(user._id, "Patient"); // Convert _id to string
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in' });
    }
}

const loginDoctor = async (Doctor: Model<IDoctor, {}, {}, {}, Document<unknown, {}, IDoctor> & IDoctor & Required<{ _id: unknown; }>, any>, req : Request, res : Response) => {
    const { name, email, password } = req.body;
    try {
        const user = await Doctor.findOne({
            $or: [{ email }, { name }] 
        }).exec();

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = createToken(user._id, "Patient"); // Convert _id to string
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in' });
    }
}

const loginAdmin = async(Admin: Model<IAdmin, {}, {}, {}, Document<unknown, {}, IAdmin> & IAdmin & Required<{ _id: unknown; }>, any>, req : Request, res : Response) => {
    const { name, email, password } = req.body;
    try {
        const user = await Admin.findOne({
            $or: [{ email }, { name }] 
        }).exec();

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = createToken(user._id, "Patient"); // Convert _id to string
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in' });
    }
}
// Logout is handled client-side by clearing the token


