// src/routes/patientRoutes.ts
import express from "express";
import {
  getPatientAppointments,
  createAppointment,
  getAvailableDoctors,
  getAppointmentDetails,
  rescheduleAppointment,
  cancelAppointment,
  getNextAppointment,
  submitFeedback,
} from "../controllers/patientController";
import { authenticateUser } from "../middleware/adminMiddleware";

const router = express.Router();

router.get("/:id/appointments", authenticateUser, getPatientAppointments);
router.post("/:id/appointments", authenticateUser, createAppointment);
router.post("/:id/doctors", authenticateUser, getAvailableDoctors);
router.get(
  "/:id/appointments/:appointmentId",
  authenticateUser,
  getAppointmentDetails
);
router.put(
  "/:id/appointments/:appointmentId",
  authenticateUser,
  rescheduleAppointment
);
router.delete(
  "/:id/appointments/:appointmentId",
  authenticateUser,
  cancelAppointment
);
router.get("/:id/next", authenticateUser, getNextAppointment);
router.post("/:id/feedback/:appointmentId", authenticateUser, submitFeedback);

export default router;
