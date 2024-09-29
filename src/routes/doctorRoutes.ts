// src/routes/doctorRoutes.ts
import express from "express";
import {
  getDoctorAppointments,
  setAvailability,
  getAvailability,
  updateAvailability,
  removeAvailability,
  addConsultationNotes,
  viewFeedback,
} from "../controllers/doctorController";
import { authenticateUser } from "../middleware/adminMiddleware";

const router = express.Router();

router.get("/:id/appointments", authenticateUser, getDoctorAppointments);
router.post("/:id/availability", authenticateUser, setAvailability);
router.get("/:id/availability", authenticateUser, getAvailability);
router.put("/:id/availability/:slotId", authenticateUser, updateAvailability);
router.delete(
  "/:id/availability/:slotId",
  authenticateUser,
  removeAvailability
);
router.post(
  "/:id/notes/:appointmentId",
  authenticateUser,
  addConsultationNotes
);
router.get("/:id/feedback", viewFeedback);

export default router;
