// src/controllers/doctorController.ts
import { Request, Response } from "express";
import { Appointment } from "../models/Appointment";
import { Availability, ITimeRange } from "../models/Availability";
import { Feedback } from "../models/Feedback";

// Retrieve appointments for a doctor
export const getDoctorAppointments = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id;

    // Get the current date to filter future appointments
    const currentDate = new Date();

    // Find appointments that are active and scheduled for a future date
    const appointments = await Appointment.find({
      doctorId,
      isActive: true,
      date: { $gt: currentDate }, // Only future appointments
    }).sort({ date: 1 }); // Sort by date in ascending order

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

// Set availability for a doctor
export const setAvailability = async (req: Request, res: Response) => {
  try {
    const { date, timeRanges } = req.body;
    const doctorId = req.params.id;

    // Find existing availability for the doctor on the given date
    let availability = await Availability.findOne({
      doctorId,
      "availableDates.date": date,
    });

    if (availability) {
      // If availability for this date exists, push the new time ranges
      availability.availableDates.forEach((availableDate) => {
        if (availableDate.date === date) {
          availableDate.timeRanges.push(...timeRanges);
        }
      });
    } else {
      // If no availability for the date, create new availability
      availability = new Availability({
        doctorId,
        availableDates: [{ date, timeRanges }],
      });
    }

    await availability.save();
    res.status(201).json(availability);
  } catch (err) {
    res.status(500).json({ message: "Error setting availability" });
  }
};

// View availability for a doctor
export const getAvailability = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id;
    const { date } = req.query; // Assumes date is passed as a query parameter

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Find availability for the specified doctor and date
    const availability = await Availability.findOne({
      doctorId,
      availableDates: { $elemMatch: { date } }, // Match the date in availableDates array
    });

    if (!availability) {
      return res
        .status(404)
        .json({ message: "Availability not found for this doctor" });
    }

    // Find all booked appointments for the doctor on the specified date
    const bookedAppointments = await Appointment.find({
      doctorId,
      date: date,
      isActive: true,
    });

    // Extract booked time ranges from appointments
    const bookedTimeRanges = bookedAppointments.map(
      (appointment) => appointment.timeRange
    );

    // Filter out booked time ranges from the available dates
    availability.availableDates.forEach((availableDate) => {
      if (availableDate.date === date) {
        availableDate.timeRanges = availableDate.timeRanges.filter(
          (timeRange: ITimeRange) => {
            return !bookedTimeRanges.some(
              (bookedRange) =>
                bookedRange.start <= timeRange.endTime &&
                bookedRange.end >= timeRange.startTime // Overlap condition
            );
          }
        );
      }
    });

    res.status(200).json(availability);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching availability", error: err });
  }
};

// Update a specific availability slot
export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { date, timeRanges } = req.body;
    const doctorId = req.params.id;

    // Find the availability for the doctor on the given date
    const availability = await Availability.findOne({
      doctorId,
      "availableDates.date": date,
    });

    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    // Update the timeRanges for the specific date
    availability.availableDates.forEach((availableDate) => {
      if (availableDate.date === date) {
        availableDate.timeRanges = timeRanges;
      }
    });

    await availability.save();
    res.status(200).json(availability);
  } catch (err) {
    res.status(500).json({ message: "Error updating availability" });
  }
};

// Remove an availability slot
export const removeAvailability = async (req: Request, res: Response) => {
  try {
    const { date, timeRange } = req.body;
    const doctorId = req.params.id;

    // Find the availability for the doctor on the given date
    const availability = await Availability.findOne({
      doctorId,
      "availableDates.date": date,
    });

    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    // Remove the timeRange from the specific date
    availability.availableDates.forEach((availableDate) => {
      if (availableDate.date === date) {
        availableDate.timeRanges = availableDate.timeRanges.filter(
          (range) =>
            !(
              range.startTime === timeRange.startTime &&
              range.endTime === timeRange.endTime
            )
        );
      }
    });

    // If no timeRanges left for a specific date, remove the entire date
    availability.availableDates = availability.availableDates.filter(
      (availableDate) => availableDate.timeRanges.length > 0
    );

    await availability.save();
    res.status(200).json({ message: "Availability removed", availability });
  } catch (err) {
    res.status(500).json({ message: "Error removing availability" });
  }
};

// Add consultation notes
export const addConsultationNotes = async (req: Request, res: Response) => {
  // Assuming there is a notes field in Appointment or related model
  try {
    const { notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { $push: { notes } },
      { new: true }
    );
    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Error adding notes" });
  }
};

// View feedback for a doctor
export const viewFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.find({ doctorId: req.params.id });
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Error fetching feedback" });
  }
};
