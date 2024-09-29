import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Patient } from "../models/Patient";
import { Doctor } from "../models/Doctor";
import { authenticateAdmin } from "./adminMiddleware";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  const { role } = req.body;

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  try {
    if (role == "patient") {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      const patient = await Patient.findById(decoded.id);

      if (!patient) {
        return res
          .status(403)
          .json({ message: "Access denied. Invalid token." });
      }
      next();
    } else if (role == "doctor") {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      const patient = await Doctor.findById(decoded.id);

      if (!patient) {
        return res
          .status(403)
          .json({ message: "Access denied. Invalid token." });
      }
      next();
    } else {
      authenticateAdmin;
    }
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};
