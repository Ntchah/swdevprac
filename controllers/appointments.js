const Appointment = require("../models/Appointment");
const Dentist = require("../models/Dentist");
const { client } = require("../config/redis/redisClient"); // Use the shared Redis client

//@desc Get all appointments
//@route GET /api/v1/appointments
//@access Public
exports.getAppointments = async (req, res, next) => {
  try {
    let query;

    if (req.query.user && req.query.user !== "admin") {
      query = Appointment.find({ user: req.query.user }).populate({
        path: "dentist",
        select: "name yearsOfExperience area",
      });
    } else if (req.params.dentistId) {
      console.log(req.params.dentistId);
      query = Appointment.find({ dentist: req.params.dentistId }).populate({
        path: "dentist",
        select: "name yearsOfExperience area",
      });
    } else {
      query = Appointment.find().populate({
        path: "dentist",
        select: "name yearsOfExperience area",
      });
    }

    const appointments = await query.exec();

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Cannot find Appointments" });
  }
};


//@desc Get single appointment
//@route GET /api/v1/appointments/:id
//@access Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: "dentist",
      select: "name yearsOfExperience area",
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: ` No appointment with the id of ${req.params.id}` });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Cannot find Appointment" });
  }
};

// @desc Add appointment
// @route POST /api/v1/dentists/:dentistId/appointments
// @access Private
exports.addAppointment = async (req, res, next) => {
  try {
    const { apptDate, apptTimeSlot } = req.body;
    const dentistId = req.params.dentistId;
    const userId = req.user.id;

    // Validate dentist
    const dentist = await Dentist.findById(dentistId);
    if (!dentist) {
      return res.status(404).json({ success: false, message: "Cannot find Dentist" });
    }

    // Check if user already has an appointment in MongoDB
    const existingAppointment = await Appointment.findOne({ user: userId });
    if (existingAppointment && req.user.role !== "admin") {
      return res.status(400).json({ success: false, message: `User ${userId} already has an appointment.` });
    }

    // Validate dentist's available timeslot
    const dateSlot = dentist.timeslots.find((slot) => slot.date === apptDate);
    if (!dateSlot) {
      return res.status(400).json({ success: false, message: "No available timeslots for this date" });
    }

    const slot = dateSlot.slots.find((s) => s.time === apptTimeSlot);
    if (!slot) {
      return res.status(400).json({ success: false, message: "Invalid time slot" });
    }

    if (slot.booked) {
      return res.status(400).json({ success: false, message: "Time slot already booked" });
    }

    // Redis key for booking session
    const bookingKey = `booking:${dentistId}:${apptDate}:${apptTimeSlot}`;

    // Check if timeslot is already booked in Redis
    const existingBooking = await client.get(bookingKey);
    if (existingBooking) {
      return res.status(400).json({ success: false, message: "This timeslot is already reserved." });
    }

    // Reserve the slot in Redis (expires in 10 minutes)
    await client.SETEX(bookingKey, 600, JSON.stringify({ userId, dentistId, apptDate, apptTimeSlot }));

    return res.status(201).json({ success: true, message: "Timeslot reserved! Confirm within 10 minutes." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Confirm appointment
// @route POST /api/v1/dentists/:dentistId/appointments/confirm
// @access Private
exports.confirmAppointment = async (req, res) => {
  try {
    const { apptDate, apptTimeSlot } = req.body;
    const dentistId = req.params.dentistId;
    const userId = req.user.id;

    // Redis key for reservation
    const bookingKey = `booking:${dentistId}:${apptDate}:${apptTimeSlot}`;

    // Retrieve from Redis
    const bookingData = await client.get(bookingKey);
    if (!bookingData) {
      return res.status(400).json({ success: false, message: "Booking session expired or does not exist." });
    }

    // Check if user owns this booking
    const parsedBooking = JSON.parse(bookingData);
    if (parsedBooking.userId !== userId) {
      return res.status(400).json({ success: false, message: "This timeslot is already reserved by another user." });
    }

    // Validate dentist and timeslot in MongoDB
    const dentist = await Dentist.findById(dentistId);
    if (!dentist) {
      return res.status(404).json({ success: false, message: "Cannot find Dentist" });
    }

    const dateSlot = dentist.timeslots.find((slot) => slot.date === apptDate);
    if (!dateSlot) {
      return res.status(400).json({ success: false, message: "No available timeslots for this date" });
    }

    const slot = dateSlot.slots.find((s) => s.time === apptTimeSlot);
    if (!slot) {
      return res.status(400).json({ success: false, message: "Invalid time slot" });
    }

    if (slot.booked) {
      await client.del(bookingKey); // Cleanup expired Redis session
      return res.status(400).json({ success: false, message: "Time slot already booked in MongoDB" });
    }

    // Confirm appointment in MongoDB
    const appointment = await Appointment.create({ user: userId, dentist: dentistId, apptDate, apptTimeSlot });

    // Mark slot as booked in MongoDB
    slot.booked = true;
    await dentist.save();

    // Remove booking session from Redis
    await client.del(bookingKey);

    return res.status(201).json({ success: true, data: appointment, message: "Appointment confirmed successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// @desc Update appointment
// @route PUT /api/v1/appointments/:id
// @access Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to update this appointment",
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// @desc Delete appointment
// @route DELETE /api/v1/appointments/:id
// @access Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this appointment`,
      });
    }

    await appointment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
