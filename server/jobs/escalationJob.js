const cron = require("node-cron");
const Complaint = require("../models/Complaint");

const startEscalationJob = () => {
  cron.schedule("0 2 * * *", async () => {
    try {
      const threshold = Number(process.env.UPVOTE_ESCALATION_THRESHOLD || 10);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const result = await Complaint.updateMany(
        {
          status: "pending",
          createdAt: { $lte: sevenDaysAgo },
          upvotes: { $gte: threshold }
        },
        {
          $set: { status: "escalated" },
          $push: { timeline: { status: "escalated", updatedAt: new Date() } }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`Escalation job: escalated ${result.modifiedCount} complaints`);
      }
    } catch (error) {
      console.error("Escalation job failed:", error.message);
    }
  });
};

module.exports = startEscalationJob;
