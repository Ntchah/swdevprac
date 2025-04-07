const Maintenance = require("../models/Maintenance");

module.exports = async (req, res, next) => {
  const maintenance = await Maintenance.findOne({});
  if (maintenance && maintenance.active) {
    const now = new Date();
    if (now >= maintenance.start && now <= maintenance.end) {
      return res.status(503).json({
        success: false,
        message: "Booking is currently unavailable due to maintenance.",
      });
    }
  }
  next();
};
