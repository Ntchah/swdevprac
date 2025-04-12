const express = require("express");
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  confirmAppointment,
} = require("../controllers/appointments");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");

router.route("/").get(protect, getAppointments).post(protect, authorize("admin", "user"), createAppointment);
router.route("/confirm").post(protect, authorize("admin", "user"),confirmAppointment);
router.route("/:id").get(protect, getAppointment).put(protect, authorize("admin", "user"), updateAppointment).delete(protect, authorize("admin", "user"), deleteAppointment);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - apptDate
 *         - apptTimeSlot
 *         - user
 *         - dentist
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated ID of the appointment
 *           example: d290f1ee-6c54-4b01-90e6-d701749f0851
 *         apptDate:
 *           type: string
 *           format: date
 *           description: Appointment date in YYYY-MM-DD format
 *           example: "2025-04-10"
 *         apptTimeSlot:
 *           type: string
 *           description: Time slot for the appointment
 *           example: "10:00 AM - 11:00 AM"
 *         user:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who booked the appointment
 *           example: "609bda561452242d88d36e37"
 *         dentist:
 *           type: string
 *           format: uuid
 *           description: The ID of the dentist for the appointment
 *           example: "609bda561452242d88d36e38"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the appointment was created
 *           example: "2025-04-04T12:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: The appointments managing API
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all appointments
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 */

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get an appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 */

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update an appointment
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 */

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Reserve a timeslot for appointment (temporary lock in Redis)
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apptDate
 *               - apptTimeSlot
 *               - dentistId
 *             properties:
 *               apptDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-12"
 *               apptTimeSlot:
 *                 type: string
 *                 example: "09:00-10:00"
 *               dentistId:
 *                 type: string
 *                 format: uuid
 *                 example: "6618a3340b1e9cfa2e987abc"
 *     responses:
 *       201:
 *         description: Timeslot successfully reserved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Timeslot successfully reserved! Please confirm within 10 minutes.
 *       400:
 *         description: Validation error or missing timeslot
 *       404:
 *         description: Dentist not found
 *       409:
 *         description: Slot already locked
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /appointments/confirm:
 *   post:
 *     summary: Confirm a reserved appointment
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apptDate
 *               - apptTimeSlot
 *               - dentistId
 *             properties:
 *               apptDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-12"
 *               apptTimeSlot:
 *                 type: string
 *                 example: "09:00-10:00"
 *               dentistId:
 *                 type: string
 *                 format: uuid
 *                 example: "6618a3340b1e9cfa2e987abc"
 *     responses:
 *       201:
 *         description: Appointment confirmed and saved to database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error or user already has an appointment
 *       404:
 *         description: Dentist or locked timeslot not found
 *       409:
 *         description: Booking expired or not found in Redis
 *       500:
 *         description: Server error
 */

