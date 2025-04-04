const express = require("express");

const {
  getDentists,
  getDentist,
  createDentist,
  updateDentist,
  deleteDentist,
} = require("../controllers/dentists");
const appointmentRouter = require("./appointments");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.use("/:dentistId/appointments", appointmentRouter);
router.use("/:dentistId/appointments/confirm",appointmentRouter);

router.route("/").get(getDentists).post(protect, authorize("admin"), createDentist);
router.route("/:id").get(getDentist).put(protect, authorize("admin"), updateDentist).delete(protect, authorize("admin"), deleteDentist);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Dentist:
 *       type: object
 *       required:
 *         - name
 *         - yearsOfExperience
 *         - area
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated ID of the dentist
 *           example: d290f1ee-6c54-4b01-90e6-d701749f0851
 *         name:
 *           type: string
 *           description: Dentist's full name
 *           example: Dr. John Doe
 *         yearsOfExperience:
 *           type: integer
 *           description: Years of experience
 *           example: 10
 *         area:
 *           type: string
 *           description: Area of expertise
 *           example: Orthodontics
 *         timeslots:
 *           type: array
 *           description: Available timeslots
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Appointment date in YYYY-MM-DD format
 *                 example: 2025-04-10
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time:
 *                       type: string
 *                       description: Time slot
 *                       example: "09:00 AM"
 *                     appointment:
 *                       type: string
 *                       format: uuid
 *                       description: Appointment ID if booked
 *                       example: null
 *                     booked:
 *                       type: boolean
 *                       description: Whether the time slot is booked
 *                       example: false
 */

/**
 * @swagger
 *   tags:
 *     name: Dentists
 *     description: The dentists managing API
 */

/**
* @swagger
* /dentists:
*   get:
*     summary: Returns the list of all dentists
*     tags: [Dentists]
*     responses:
*       200:
*         description: The list of dentists
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Dentist'
*   post:
*     summary: Create a new dentist
*     tags: [Dentists]
*     security:
*       - BearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Dentist'
*     responses:
*       201:
*         description: Dentist created successfully
*       403:
*         description: Unauthorized access
*/

/**
* @swagger
* /dentists/{id}:
*   get:
*     summary: Get a single dentist by ID
*     tags: [Dentists]
*     parameters:
*       - name: id
*         in: path
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Dentist data retrieved
*       404:
*         description: Dentist not found
*   put:
*     summary: Update a dentist by ID
*     tags: [Dentists]
*     security:
*       - BearerAuth: []
*     parameters:
*       - name: id
*         in: path
*         required: true
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Dentist'
*     responses:
*       200:
*         description: Dentist updated successfully
*       403:
*         description: Unauthorized access
*   delete:
*     summary: Delete a dentist by ID
*     tags: [Dentists]
*     security:
*       - BearerAuth: []
*     parameters:
*       - name: id
*         in: path
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Dentist deleted successfully
*       403:
*         description: Unauthorized access
*/

/**
* @swagger
* /dentists/{dentistId}/appointments:
*   get:
*     summary: Get appointments for a dentist
*     tags: [Appointments]
*     parameters:
*       - name: dentistId
*         in: path
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: List of appointments
*   post:
*     summary: Create an appointment for a dentist
*     tags: [Appointments]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               date:
*                 type: string
*               time:
*                 type: string
*     responses:
*       201:
*         description: Appointment created
*/

/**
* @swagger
* /dentists/{dentistId}/appointments/confirm:
*   post:
*     summary: Confirm an appointment for a dentist
*     tags: [Appointments]
*     parameters:
*       - name: dentistId
*         in: path
*         required: true
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               appointmentId:
*                 type: string
*     responses:
*       200:
*         description: Appointment confirmed
*/

