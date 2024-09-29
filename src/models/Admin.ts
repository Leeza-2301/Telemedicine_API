import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  issuperadmin: boolean;
}

const adminSchema: Schema<IAdmin> = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  issuperadmin: { type: Boolean, default: false }, // Superadmin flag
});

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
