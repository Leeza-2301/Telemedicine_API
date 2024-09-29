import { Request, Response } from "express";
import { Appointment } from "../models/Appointment";
import { Admin } from "../models/Admin";
import { Patient } from "../models/Patient";
import { Doctor } from "../models/Doctor";
import bcrypt from "bcryptjs";

// Get all appointments
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find().populate(
      "patientId doctorId"
    );
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving appointments" });
  }
};

// Get appointment details
export const getAppointmentDetails = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId).populate(
      "patientId doctorId"
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving appointment details" });
  }
};

// Schedule a new appointment
export const scheduleAppointment = async (req: Request, res: Response) => {
  const { patientId, doctorId, date, timeRange } = req.body;

  try {
    if (
      !patientId ||
      !doctorId ||
      !date ||
      !timeRange ||
      !timeRange.start ||
      !timeRange.end
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the patient exists
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if the doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const existingAppointment = await Appointment.findOne({
      patientId,
      doctorId,
      date,
      isActive: true,
      timeRange: {
        $elemMatch: {
          start: { $lt: timeRange.end },
          end: { $gt: timeRange.start },
        },
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        message:
          "An active appointment already exists for this patient and doctor at the selected date and time range.",
      });
    }

    // Create a new appointment
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      date,
      timeRange: [timeRange],
      isActive: true,
    });

    await newAppointment.save();

    res.status(201).json({
      message: "Appointment scheduled successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error scheduling appointment" });
  }
};

// Reschedule an existing appointment
export const rescheduleAppointment = async (req: Request, res: Response) => {
  const { appointmentId, date, timeRange } = req.body; // Get appointmentId from body

  try {
    // Fetch the existing appointment to get doctorId
    const existingAppointment = await Appointment.findById(appointmentId);

    if (!existingAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctorId = existingAppointment.doctorId;

    // Check if the doctor is available at the new date and time range
    const conflictingAppointment = await Appointment.findOne({
      doctorId: doctorId,
      date: date,
      isActive: true,
      timeRange: {
        $elemMatch: {
          start: { $lt: timeRange.end }, // New start is before existing end
          end: { $gt: timeRange.start }, // New end is after existing start
        },
      },
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        message: "Doctor is not available at the selected date and time range",
      });
    }

    // Proceed with updating the appointment if no conflict is found
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { date, timeRange: [timeRange] }, // Update with new date and timeRange
      { new: true }
    );

    res.status(200).json({
      message: "Appointment rescheduled successfully",
      updatedAppointment,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error rescheduling appointment"
      });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req: Request, res: Response) => {
  const { appointmentId } = req.params;

  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(
      appointmentId
    );
    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ message: "Appointment canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error canceling appointment" });
  }
};

// Generate appointment reports future enhancement
// export const generateAppointmentReports = async (
//   req: Request,
//   res: Response
// ) => {
//   // Placeholder for report generation logic
//   res
//     .status(200)
//     .json({ message: "Report generation logic not implemented yet." });
// };

// Get all doctors
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving doctors" });
  }
};

// Get all patients
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving patients" });
  }
};

// Create a new admin
export const createAdmin = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    const newAdmin = new Admin({ username, email, password: hashedPassword });
    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully", newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin" });
  }
};

// Delete an admin
export const deleteAdmin = async (req: Request, res: Response) => {
  const { adminId } = req.params;

  try {
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);
    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin" });
  }
};
