const express = require("express");
const router = express.Router();
const Maintenance = require("../models/Maintenance");
const { protect, authorize } = require("../middleware/auth");

router.post("/maintenance", protect, authorize("admin"), async (req, res) => {
  const { active, start, end } = req.body;
  const settings = await Maintenance.findOneAndUpdate(
    {},
    { active, start, end },
    { upsert: true, new: true }
  );
  res.status(200).json({ success: true, data: settings });
});

module.exports = router;

/**
 * @swagger
 * /admin/maintenance:
 *   post:
 *     summary: Set system maintenance period
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               active:
 *                 type: boolean
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *             example:
 *               active: true
 *               start: 2025-04-07T00:00:00.000Z
 *               end: 2025-04-08T00:00:00.000Z
 *     responses:
 *       200:
 *         description: Maintenance window set
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
