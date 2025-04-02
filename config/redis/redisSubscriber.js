const { client } = require("./redisClient"); 
const Dentist = require("../../models/Dentist"); 

const sub = client.duplicate(); // Create a Redis subscriber

sub.on("message", async (channel, expiredKey) => {
  if (channel === "__keyevent@0__:expired" && expiredKey.startsWith("booking:")) {
    const [, dentistId, apptDate, apptTimeSlot] = expiredKey.split(":");

    try {
      const dentist = await Dentist.findById(dentistId);
      if (dentist) {
        const dateSlot = dentist.timeslots.find((slot) => slot.date === apptDate);
        if (dateSlot) {
          const slot = dateSlot.slots.find((s) => s.time === apptTimeSlot);
          if (slot) {
            slot.booked = false;
            await dentist.save();
            console.log(`Released expired slot: ${expiredKey}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error releasing expired slot ${expiredKey}:`, error);
    }
  }
});

// Subscribe to expired keys
sub.subscribe("__keyevent@0__:expired");

module.exports = sub;
