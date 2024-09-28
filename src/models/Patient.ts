//Patient's data schemas

import mongoose,{Schema,Document} from "mongoose";

export interface IPatient extends Document {
    //patientId:mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
  }


  const PatientSchema: Schema = new Schema({
    //patientId: { type: mongoose.Types.ObjectId, required: true, unique: true }, 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  });
  
  export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
