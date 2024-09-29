// src/controllers/patientController.ts
import { Request, Response } from "express";
import { Appointment } from "../models/Appointment";
import { Doctor } from "../models/Doctor";
import { Feedback } from "../models/Feedback";
import { Patient } from "../models/Patient";

// Retrieve all appointments for a patient
export const getPatientAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.id });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

// Book a new appointment
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, date, timeRange } = req.body; 

    // Validate input data
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

    // Check if an active appointment already exists for the patient and doctor at the same date and time range
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
      message: "Appointment created successfully",
      appointment: newAppointment,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating appointment", error: err });
  }
};

// Get available doctors
export const getAvailableDoctors = async (req: Request, res: Response) => {
  try {
    const { date, timeRange } = req.body; 

    if (!date || !timeRange || !timeRange.start || !timeRange.end) {
      return res.status(400).json({
        message: "Please provide date and timeRange (start and end).",
      });
    }

    // Find all doctors
    const doctors = await Doctor.find({});

    // Find doctors who do not have an active appointment at the given date and time range
    const availableDoctors = [];
    for (const doctor of doctors) {
      const hasAppointment = await Appointment.findOne({
        doctorId: doctor._id,
        date: date,
        isActive: true, 
        timeRange: {
          $elemMatch: {
            start: { $lt: timeRange.end }, 
            end: { $gt: timeRange.start }, 
          },
        },
      });

      if (!hasAppointment) {
        availableDoctors.push(doctor);
      }
    }

    res.status(200).json(availableDoctors);
  } catch (err) {
    res.status(500).json({ message: "Error fetching available doctors" });
  }
};

// View appointment details
export const getAppointmentDetails = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointment details" });
  }
};

// Reschedule an appointment
export const rescheduleAppointment = async (req: Request, res: Response) => {
  try {
    const { date, timeRange } = req.body; // Expecting timeRange as an object with start and end
    const appointmentId = req.params.appointmentId;

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
      isActive: true, // Assuming you have an `isActive` field in your appointment schema
      timeRange: {
        $elemMatch: {
          start: { $lt: timeRange.end }, // Start of new range is before the end of existing
          end: { $gt: timeRange.start }, // End of new range is after the start of existing
        },
      },
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        message: "Doctor is not available at the selected date and time",
      });
    }

    // Proceed with updating the appointment if no conflict is found
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { date, timeRange },
      { new: true }
    );

    res.status(200).json(updatedAppointment);
  } catch (err) {
    res.status(500).json({ message: "Error rescheduling appointment" });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.appointmentId, {
      status: "cancelled",
      isActive: "false",
    });
    res.status(200).json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling appointment" });
  }
};

// Leave feedback after a session
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const { appointmentId } = req.params;
    const patientId = req.params.id;

    // Check if the appointment exists
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Ensure that the patient is the one trying to leave feedback
    if (appointment.patientId.toString() !== patientId) {
      return res.status(403).json({
        message:
          "You are not authorized to leave feedback for this appointment",
      });
    }

    const currentDate = new Date();
    const appointmentDate = new Date(appointment.date);

    if (appointmentDate > currentDate) {
      return res.status(400).json({
        message:
          "Feedback can only be submitted after the appointment has taken place",
      });
    }

    // Check if feedback is already submitted for this appointment
    const existingFeedback = await Feedback.findOne({ appointmentId });

    if (existingFeedback) {
      return res.status(400).json({
        message: "Feedback for this appointment has already been submitted",
      });
    }

    // Submit the feedback
    const newFeedback = new Feedback({
      appointmentId,
      patientId,
      doctorId: appointment.doctorId,
      rating,
      comment,
    });
    await newFeedback.save();

    // Mark the appointment as completed and inactive
    appointment.isActive = false;
    appointment.status = "completed";
    await appointment.save();

    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(500).json({ message: "Error submitting feedback" });
  }
};

// all the apoitments
export const getNextAppointment = async (req: Request, res: Response) => {
  const patientId = req.params.id;

  try {
    const nextAppointment = await Appointment.findOne({
      patient: patientId,
      date: { $gte: new Date() }, // Find upcoming appointments
    })
      .populate("doctor")
      .sort({ date: 1, time: 1 }) // Sort by date to get the next appointment
      .exec();

    if (!nextAppointment) {
      return res
        .status(404)
        .json({ message: "No upcoming appointments found." });
    }

    res.status(200).json(nextAppointment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving next appointment", error });
  }
};
