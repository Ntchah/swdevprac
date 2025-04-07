const mongoose = require("mongoose");

const MaintenanceSchema = new mongoose.Schema({
    active: {
      type: Boolean,
      default: false,
    },
    start: Date,
    end: Date,
});

module.exports = mongoose.model("Maintenance", MaintenanceSchema);
  
  