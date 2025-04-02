const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  apptDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    unique: true, // Ensure 1 user 1 appointment
    required: true,
  },
  dentist: {
    type: mongoose.Schema.ObjectId,
    ref: "Dentist",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
