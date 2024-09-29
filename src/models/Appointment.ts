import mongoose, { Schema, Document } from 'mongoose';

interface ITimeRange {
  start: string; 
  end: string;   
}

interface IAppointment extends Document {
  patientId: mongoose.Schema.Types.ObjectId;
  doctorId: mongoose.Schema.Types.ObjectId;
  date: Date;
  timeRange: ITimeRange; 
  status: string;
  isActive: boolean; 
}

const appointmentSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  timeRange: { 
    start: { type: String, required: true }, 
    end: { type: String, required: true }    
  },
  status: { type: String, default: 'scheduled' },
  isActive: { type: Boolean, default: true }
});

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
export { Appointment, IAppointment };
