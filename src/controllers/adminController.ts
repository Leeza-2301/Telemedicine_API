// src/controllers/adminController.ts
import { Request, Response } from "express";
import { Admin } from "../models/Admin";
import { Patient } from "../models/Patient";
import { Doctor } from "../models/Doctor";
import bcrypt from "bcryptjs";

// Create new admin (superadmin only)
export const createAdmin = async (req: Request, res: Response) => {
    const { name, email, password , role } = req.body;
  
    // Assuming req.user contains the authenticated user's information
    const currentUser = role; // This should be populated from your authentication middleware
  
    try {
      // Check if the current user is a superadmin
      if (!currentUser || !currentUser.isSuperAdmin) {
        return res.status(403).json({ message: 'Access denied. Only superadmin can create other admins.' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({ name, email, password: hashedPassword });
      await newAdmin.save();
      res.status(201).json({ message: 'Admin created' });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: 'Error creating admin' });
    }
  };

// Delete a patient or doctor (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  const { userType, userId } = req.params;
  try {
    if (userType === "patient") await Patient.findByIdAndDelete(userId);
    if (userType === "doctor") await Doctor.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting user" });
  }
};
