// //Doctor's data schemas

// import mongoose, { Schema, Document } from 'mongoose';

// export interface IDoctor extends Document {
//   doctorId: mongoose.Types.ObjectId; 
//   name: string;
//   email: string;
//   password: string;
// }

// const DoctorSchema: Schema = new Schema({
//   doctorId: { type: mongoose.Types.ObjectId, required: true, unique: true }, 
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);


import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
    name: string;
    email: string;
    password: string;
    specialization: string;
}

const DoctorSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialization: { type: String },
});

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
