const mongoose = require("mongoose");
const validTimeslots = require("../utils/enum/timeslots");

const AppointmentSchema = new mongoose.Schema({
  apptDate: {
    type: String,
    required: [true, "Please add appointment date"],
    match: [
      /^\d{4}-\d{2}-\d{2}$/,
      "Date must be in YYYY-MM-DD format.",
    ],
  },
  apptTimeSlot: { 
    type: String, 
    required: [true, "Please add appointment timeslot"],
    enum: validTimeslots, 
    required: true 
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
