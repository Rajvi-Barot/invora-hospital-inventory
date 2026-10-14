const cron = require("node-cron");
const Alert = require("../models/Alert");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

cron.schedule("0 9 * * 1", async () => {
  try {

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const unsafeAlerts = await Alert.countDocuments({
      type: "UNSAFE",
      createdAt: { $gte: oneWeekAgo }
    });

    const leaveRequests = await Alert.countDocuments({
      type: "LEAVE_REQUEST",
      createdAt: { $gte: oneWeekAgo }
    });

    const admins = await User.find({ role: "admin" });

    const message = `
INVORA Weekly Summary

Unsafe Temperature Alerts: ${unsafeAlerts}

Leave Requests: ${leaveRequests}

Generated automatically by INVORA Monitoring System.
`;

    for (const admin of admins) {
      await sendEmail(admin.email, "INVORA Weekly Summary", message);
    }

    console.log("📧 Weekly summary email sent");

  } catch (error) {
    console.error(error);
  }
});