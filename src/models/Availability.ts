import mongoose, { Schema, Document } from "mongoose";

interface ITimeRange {
  startTime: string;
  endTime: string;
}

interface IAvailableDate {
  date: string;
  timeRanges: ITimeRange[];
}

interface IAvailability extends Document {
  doctorId: mongoose.Schema.Types.ObjectId;
  availableDates: IAvailableDate[];
}

const timeRangeSchema: Schema = new Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const availableDateSchema: Schema = new Schema({
  date: { type: String, required: true },
  timeRanges: { type: [timeRangeSchema], required: true },
});

const availabilitySchema: Schema = new Schema({
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  availableDates: { type: [availableDateSchema], required: true },
});

const Availability = mongoose.model<IAvailability>(
  "Availability",
  availabilitySchema
);


export { Availability, IAvailability, IAvailableDate, ITimeRange };
