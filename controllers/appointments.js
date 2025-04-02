const Appointment = require("../models/Appointment");
const Dentist = require("../models/Dentist");

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
      return res.status(404).json({success:false, message:` No appointment with the id of ${req.params.id}`});
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({success:false, message:"Cannot find Appointment"});
  }
};

// @desc Add appointment
// @route POST /api/v1/dentists/:dentistId/appointments
// @access Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.dentist = req.params.dentistId;

    const dentist = await Dentist.findById(req.params.dentistId);

    if (!dentist) {
      return res.status(404).json({ success: false, message:"Cannot find Dentist" });
    }

    req.body.user = req.user.id;
    const existingAppointment = await Appointment.find({
      user: req.user.id,
    });

    if (existingAppointment.length == 1 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: ` The user with ID ${req.user.id} has already made 1 appointment`,
      });
    }

    const appointment = await Appointment.create(req.body);

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false });
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
