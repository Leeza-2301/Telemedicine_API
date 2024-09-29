import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin";
import { Patient } from "../models/Patient";
import { Doctor } from "../models/Doctor";
import { createToken } from "../utils/token";

// Register new user or doctor
export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body;
  const hasToken = req.cookies.token;
  try {
    if (hasToken) res.status(403).json({ message: "You already loggedin." });
    const hashedPassword = await bcrypt.hash(password, 12);
    let user;
    if (role == "doctor") {
      const newUser = new Doctor({
        username,
        email,
        password: hashedPassword,
      });
      // console.log(newUser);
      user = await newUser.save();

      const token = createToken(user._id, role);
      res.cookie("token", token, { httpOnly: true });
      res.status(201).json({ message: "Doctor registered successfully" });
    } else {
      const newUser = new Patient({
        username,
        email,
        password: hashedPassword,
      });
      // console.log(newUser);
      user = await newUser.save();

      const token = createToken(user._id, role);
      res.cookie("token", token, { httpOnly: true });
      res.status(201).json({
        message: "Patient registered successfully",
        userid: newUser._id,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Error during register the user" });
  }
};

// Login for users, doctors, and admins
export const loginUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const hasToken = req.cookies.token;
  try {
    if (hasToken) res.status(403).json({ message: "You already loggedin." });
    let user;

    if (role === "doctor") {
      user = await Doctor.findOne({ email }).select("+password");
    } else if (role === "admin") {
      user = await Admin.findOne({ email }).select("+password");
    } else {
      user = await Patient.findOne({ email }).select("+password");
    }
    console.log(user);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = createToken(user._id, role);
    res.cookie("token", token, { httpOnly: true });

    res
      .status(200)
      .json({ message: "Login successful", userid: user._id, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Logout user
export const logoutUser = (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(400)
      .json({ message: "No token found, logout not possible." });
  }
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};
