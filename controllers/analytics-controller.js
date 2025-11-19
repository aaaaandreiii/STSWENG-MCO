const Event = require("../models/event.js");
const Transaction = require("../models/transaction.js");
const activityLogger = require("../helpers/activityLogger.js");

const controller = {
  /**
   * GET /analytics
   * Dashboard for admins/managers
   */
  getAnalyticsDashboard: async function (req, res, next) {
    try {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      // Upcoming (booked/reserved) events by month
      const upcomingEventsByMonth = await Event.aggregate([
        {
          $match: {
            status: { $in: ["booked", "reserved"] },
            eventDate: { $gte: startOfToday },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$eventDate" },
              month: { $month: "$eventDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Cancelled events by month
      const cancelledEventsByMonth = await Event.aggregate([
        {
          $match: {
            status: "cancelled",
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$eventDate" },
              month: { $month: "$eventDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Revenue summary (from Transaction.totalCost)
      const revenueAgg = await Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalCost" },
            totalPayments: { $sum: "$customerPayment" },
            transactionCount: { $sum: 1 },
          },
        },
      ]);
      const revenueSummary =
        revenueAgg && revenueAgg.length > 0
          ? revenueAgg[0]
          : {
              totalRevenue: 0,
              totalPayments: 0,
              transactionCount: 0,
            };

      // Events per venue
      const venueCounts = await Event.aggregate([
        { $unwind: "$eventVenues" },
        {
          $group: {
            _id: "$eventVenues",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Events per eventTime
      const timeOfDayCounts = await Event.aggregate([
        {
          $group: {
            _id: "$eventTime",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const username = req.session?.user?.username || "unknown";
      await activityLogger(username, "Viewed analytics dashboard");

      return res.render("analytics", {
        username,
        upcomingEventsByMonth,
        cancelledEventsByMonth,
        revenueSummary,
        venueCounts,
        timeOfDayCounts,
      });
    } catch (err) {
      console.error("[ANALYTICS][ERROR]", err);
      return next(err);
    }
  },
};

module.exports = controller;
