import mongoose, { Schema, Document } from 'mongoose';

interface IFeedback extends Document {
  appointmentId: mongoose.Schema.Types.ObjectId;
  //patientId: mongoose.Schema.Types.ObjectId;
  rating: number;
  comments: string;
}

const feedbackSchema: Schema = new Schema({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  //patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  rating: { type: Number, required: true },
  comments: { type: String, required: true }
});

const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
export { Feedback, IFeedback };
