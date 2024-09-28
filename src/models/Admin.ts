
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  adminId: String;
  name: string;
  email: string;
  password: string;
  isSuperAdmin: boolean; 
}

const AdminSchema: Schema = new Schema({
  adminId : { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSuperAdmin: { type: Boolean, required: true, default: false }, 
});


export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
