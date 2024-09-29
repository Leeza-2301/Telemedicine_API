import express from "express";
import {
  getAllAppointments,
  getAppointmentDetails,
  scheduleAppointment,
  rescheduleAppointment,
  cancelAppointment,
  // generateAppointmentReports,
  getAllDoctors,
  getAllPatients,
  createAdmin,
  deleteAdmin, // New import for deleting admin
} from "../controllers/adminController";
import {
  verifySuperAdmin,
  authenticateUser,
  authenticateAdmin,
} from "../middleware/adminMiddleware"; // New middleware to check for super admin privileges

const router = express.Router();

router.get("/appointments", authenticateAdmin, getAllAppointments);
router.get(
  "/appointments/:appointmentId",
  authenticateAdmin,
  getAppointmentDetails
);
router.post("/appointments", authenticateAdmin, scheduleAppointment);
router.put(
  "/appointments/:appointmentId",
  authenticateAdmin,
  rescheduleAppointment
);
router.delete(
  "/appointments/:appointmentId",
  authenticateAdmin,
  cancelAppointment
);
// router.get("/reports/appointments",authenticateAdmin, generateAppointmentReports);
router.get("/doctors", authenticateAdmin, getAllDoctors);
router.get("/patients", authenticateAdmin, getAllPatients);

// Only super admin can delete admins
router.delete("/admins/:adminId", verifySuperAdmin, deleteAdmin);

router.post("/admins", verifySuperAdmin, createAdmin); // Only superadmin can create other admins
router.delete("/admins/:adminId", verifySuperAdmin, deleteAdmin); // Only superadmin can delete admins

export default router;
