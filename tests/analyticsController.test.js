// tests/analyticsController.test.js
const Event = require("../models/event.js");
const Transaction = require("../models/transaction.js");
const activityLogger = require("../helpers/activityLogger.js");
const analyticsController = require("../controllers/analytics-controller.js");

jest.mock("../models/event.js");
jest.mock("../models/transaction.js");
jest.mock("../helpers/activityLogger.js");

describe("Analytics Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      session: {
        user: {
          username: "admin",
          role: "admin",
        },
      },
    };

    res = {
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("getAnalyticsDashboard", () => {
    it("renders analytics with aggregated data and logs activity", async () => {
      const upcomingEventsByMonth = [
        { _id: { year: 2025, month: 1 }, count: 3 },
      ];
      const cancelledEventsByMonth = [
        { _id: { year: 2025, month: 1 }, count: 1 },
      ];
      const revenueAgg = [
        {
          totalRevenue: 1000,
          totalPayments: 800,
          transactionCount: 5,
        },
      ];
      const venueCounts = [{ _id: "Main Hall", count: 2 }];
      const timeOfDayCounts = [{ _id: "AM", count: 4 }];

      // 4 calls to Event.aggregate in order:
      // 1) upcomingEventsByMonth
      // 2) cancelledEventsByMonth
      // 3) venueCounts
      // 4) timeOfDayCounts
      Event.aggregate
        .mockResolvedValueOnce(upcomingEventsByMonth)
        .mockResolvedValueOnce(cancelledEventsByMonth)
        .mockResolvedValueOnce(venueCounts)
        .mockResolvedValueOnce(timeOfDayCounts);

      Transaction.aggregate.mockResolvedValue(revenueAgg);
      activityLogger.mockResolvedValue();

      await analyticsController.getAnalyticsDashboard(req, res, next);

      expect(Event.aggregate).toHaveBeenCalledTimes(4);
      expect(Transaction.aggregate).toHaveBeenCalledTimes(1);

      // basic sanity check of first aggregate call (upcoming events)
      const firstCallPipeline = Event.aggregate.mock.calls[0][0];
      expect(Array.isArray(firstCallPipeline)).toBe(true);
      expect(firstCallPipeline[0]).toEqual(
        expect.objectContaining({
          $match: expect.any(Object),
        }),
      );

      expect(activityLogger).toHaveBeenCalledWith(
        "admin",
        "Viewed analytics dashboard",
      );

      expect(res.render).toHaveBeenCalledWith("analytics", {
        username: "admin",
        upcomingEventsByMonth,
        cancelledEventsByMonth,
        revenueSummary: revenueAgg[0],
        venueCounts,
        timeOfDayCounts,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("uses fallback revenueSummary when no revenueAgg results", async () => {
      const upcomingEventsByMonth = [];
      const cancelledEventsByMonth = [];
      const venueCounts = [];
      const timeOfDayCounts = [];

      Event.aggregate
        .mockResolvedValueOnce(upcomingEventsByMonth)
        .mockResolvedValueOnce(cancelledEventsByMonth)
        .mockResolvedValueOnce(venueCounts)
        .mockResolvedValueOnce(timeOfDayCounts);

      Transaction.aggregate.mockResolvedValue([]);
      activityLogger.mockResolvedValue();

      await analyticsController.getAnalyticsDashboard(req, res, next);

      const expectedSummary = {
        totalRevenue: 0,
        totalPayments: 0,
        transactionCount: 0,
      };

      expect(res.render).toHaveBeenCalledWith("analytics", {
        username: "admin",
        upcomingEventsByMonth,
        cancelledEventsByMonth,
        revenueSummary: expectedSummary,
        venueCounts,
        timeOfDayCounts,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next with error when an aggregation throws", async () => {
      const error = new Error("DB failure");
      Event.aggregate.mockRejectedValue(error);

      await analyticsController.getAnalyticsDashboard(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
    });
  });
});