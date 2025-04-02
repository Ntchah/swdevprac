const mongoose = require("mongoose");
const validTimeslots = require("../utils/enum/timeslots");

const DentistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    yearsOfExperience: {
      type: Number,
      required: [true, "Please add year of experience"],
      min: [0, "Years of experience cannot be negative"],
    },
    area: {
      type: String,
      required: [true, "Please add an area of expertise"],
    },
    timeslots: [
      {
        date: {
          type: String,
          required: [true, "Please add appointment date"],
          match: [
            /^\d{4}-\d{2}-\d{2}$/,
            "Date must be in YYYY-MM-DD format.",
          ],
        },
        slots: [
          {
            time: { 
              type: String, 
              enum: validTimeslots 
            },
            appointment: { 
              type: mongoose.Schema.Types.ObjectId,
              ref: "Appointment",
              default: null 
            },
            booked: { 
              type: Boolean, 
              default: false 
            }, 
          },
        ],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

DentistSchema.virtual("appointments", {
  ref: "Appointment",
  localField: "_id",
  foreignField: "dentist",
  justOne: false,
});

module.exports = mongoose.model("Dentist", DentistSchema);
