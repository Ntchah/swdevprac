const cron = require("node-cron");
const User = require("../models/User");

cron.schedule("0 0 * * *", async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: sevenDaysAgo },
    });

    console.log(
      `[CRON] Deleted ${result.deletedCount} unverified users older than 7 days.`
    );
  } catch (err) {
    console.error("[CRON ERROR] Failed to delete unverified users:", err);
  }
});