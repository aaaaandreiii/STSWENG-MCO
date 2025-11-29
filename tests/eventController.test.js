const eventController = require("../controllers/event-controller.js");
const Event = require("../models/event.js");
const Food = require("../models/food.js");
const Charge = require("../models/charge.js");
const Package = require("../models/package.js");
const db = require("../models/db.js");
const getEventsInMonth = require("../helpers/eventsInMonth.js");
const logActivity = require("../helpers/activityLogger.js");
const mongoose = require("mongoose");

jest.mock("../models/event.js");
jest.mock("../models/db.js");
jest.mock("../helpers/activityLogger.js");
jest.mock("../helpers/eventsInMonth.js");

describe("Event Controller", () => {
  beforeAll(() => {
    jest.spyOn(mongoose.Types, "ObjectId").mockImplementation((id) => id);
  });
  let req, res;
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      session: { user: { username: "admin" }, isAdmin: true },
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
      render: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getHome", () => {
    it("renders the home page with events", async () => {
      const mockEvents = [{ name: "Event 1" }];
      Event.aggregate.mockResolvedValue(mockEvents);

      await eventController.getHome(req, res);

      expect(res.render).toHaveBeenCalledWith("event-tracker-home", {
        events: mockEvents,
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("getCreateEvent", () => {
    it("renders the create event form", () => {
      eventController.getCreateEvent(req, res);

      expect(res.render).toHaveBeenCalledWith("event-tracker-form");
    });
  });

  describe("postCreateEvent", () => {
    it("creates an event, logs activity, and sends response", async () => {
      req.body.data = JSON.stringify({ name: "Test Event" });
      const mockDoc = { _id: "123" };
      Event.create.mockResolvedValue(mockDoc);

      await eventController.postCreateEvent(req, res);

      expect(Event.create).toHaveBeenCalledWith({ name: "Test Event" });
      expect(logActivity).toHaveBeenCalledWith("admin", "Created event: 123");
      expect(res.send).toHaveBeenCalledWith(mockDoc);
    });
  });

  describe("getEditEvent", () => {
    it("renders the edit event form", () => {
      req.params.id = "123";
      const mockEvent = { name: "Event Edit" };
      db.findOne.mockImplementation((model, query, projection, callback) => {
        callback(mockEvent);
      });

      eventController.getEditEvent(req, res);

      expect(db.findOne).toHaveBeenCalledWith(
        Event,
        { _id: "123" },
        "",
        expect.any(Function),
      );
      expect(res.render).toHaveBeenCalledWith("event-tracker-form", {
        event: mockEvent,
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("getPrintEvent", () => {
    it("renders the event receipt", async () => {
      const mockEvent = [{ name: "Event Receipt" }];
      req.params.id = "123";
      Event.aggregate.mockResolvedValue(mockEvent);

      await eventController.getPrintEvent(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { _id: expect.any(Object) } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);
      expect(res.render).toHaveBeenCalledWith("event-tracker-receipt", {
        event: mockEvent,
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("putReservations", () => {
    it("updates to be reserved, logs activity, and sends response", async () => {
      const mockDoc = { _id: "123", status: "reserved" };
      req.body = {
        id: "123",
        data: { status: "reserved" },
        modified: ["status"],
      };
      Event.findOneAndUpdate.mockResolvedValue(mockDoc);

      await eventController.putReservations(req, res);

      expect(Event.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object), status: "reserved" },
        req.body.data,
        { returnDocument: "after" },
      );
      expect(logActivity).toHaveBeenCalledWith(
        "admin",
        `Modified reservation: ${mockDoc._id}
            Modified Fields: ${req.body.modified}`,
      );
      expect(res.send).toHaveBeenCalledWith(mockDoc);
    });
  });

  describe("putPencilbookings", () => {
    it("updates to be booked, logs activity, and sends response", async () => {
      const mockDoc = { _id: "123", status: "booked" };
      req.body = {
        id: "123",
        data: { status: "booked" },
        modified: ["status"],
      };
      Event.findOneAndUpdate.mockResolvedValue(mockDoc);

      await eventController.putPencilbookings(req, res);

      expect(Event.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object), status: "booked" },
        req.body.data,
        { returnDocument: "after" },
      );
      expect(logActivity).toHaveBeenCalledWith(
        "admin",
        `Modified pencil booking: ${mockDoc._id}
            Modified Fields: ${req.body.modified}`,
      );
      expect(res.send).toHaveBeenCalledWith(mockDoc);
    });
  });

  describe("putCancelEvent", () => {
    it("updates to be cancelled, logs activity, and sends response", async () => {
      const mockDoc = { _id: "123", status: "cancelled" };
      req.body = {
        id: "123",
      };
      Event.findOneAndUpdate.mockResolvedValue(mockDoc);

      await eventController.putCancelEvent(req, res);

      expect(Event.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { status: "cancelled" },
        { returnDocument: "after" },
      );
      expect(logActivity).toHaveBeenCalledWith(
        "admin",
        `Cancelled event: ${mockDoc._id}`,
      );
      expect(res.json).toHaveBeenCalledWith(mockDoc);
    });
  });

  describe("putFinishEvent", () => {
    it("updates to be finished, logs activity, and sends response", async () => {
      const mockDoc = { _id: "123", status: "finished" };
      req.body = {
        id: "123",
      };
      Event.findOneAndUpdate.mockResolvedValue(mockDoc);

      await eventController.putFinishEvent(req, res);

      expect(Event.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { status: "finished" },
        { returnDocument: "after" },
      );
      expect(logActivity).toHaveBeenCalledWith(
        "admin",
        `Finished event: ${mockDoc._id}`,
      );
      expect(res.json).toHaveBeenCalledWith(mockDoc);
    });
  });

  describe("getPencilBookings", () => {
    it("renders pencil bookings page with booked events", async () => {
      const mockBookings = [
        { _id: "1", status: "booked", eventDate: new Date() },
        { _id: "2", status: "booked", eventDate: new Date() },
      ];
      Event.aggregate.mockResolvedValue(mockBookings);

      await eventController.getPencilBookings(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "booked" } },
        { $sort: { eventDate: 1 } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);

      expect(res.render).toHaveBeenCalledWith("event-tracker-pencilbookings", {
        bookings: mockBookings,
        username: "admin",
        isAdmin: true,
      });
    });

    it("renders page correctly when no bookings are returned", async () => {
      Event.aggregate.mockResolvedValue([]);

      await eventController.getPencilBookings(req, res);

      expect(res.render).toHaveBeenCalledWith("event-tracker-pencilbookings", {
        bookings: [],
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("getPencilBookingsFilter", () => {
    it("renders bookings", async () => {
      const mockBookings = [
        { _id: "1", status: "booked", eventDate: new Date() },
        { _id: "2", status: "booked", eventDate: new Date() },
      ];
      Event.aggregate.mockResolvedValue(mockBookings);

      await eventController.getPencilBookingsFilter(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "booked" } },
        { $sort: { eventDate: 1 } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);

      expect(res.render).toHaveBeenCalledWith("event-tracker-pencilbookings", {
        bookings: mockBookings,
        venue: undefined,
        time: undefined,
        date: undefined,
        username: "admin",
        isAdmin: true,
      });
    });

    it("applies venue, time, and date filters with descending sort", async () => {
      req.query = {
        venue: "Terrace",
        time: "10:00",
        date: "2025-11-18",
        sort: "date-dsc",
      };

      const mockBookings = [
        { _id: "1", status: "booked", eventDate: new Date() },
        { _id: "2", status: "booked", eventDate: new Date() },
        { _id: "3", status: "booked", eventDate: new Date() },
      ];
      Event.aggregate.mockResolvedValue(mockBookings);

      await eventController.getPencilBookingsFilter(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              status: "booked",
              eventVenues: { $in: ["Terrace"] },
              eventTime: "10:00",
            }),
          }),
          expect.objectContaining({ $sort: { eventDate: -1 } }),
          expect.objectContaining({
            $lookup: expect.objectContaining({ from: "packages" }),
          }),
          expect.objectContaining({
            $lookup: expect.objectContaining({ from: "foods" }),
          }),
        ]),
      );
      expect(res.render).toHaveBeenCalledWith(
        "event-tracker-pencilbookings",
        expect.objectContaining({
          bookings: mockBookings,
          venue: "Terrace",
          time: "10:00",
          date: "2025-11-18",
          username: "admin",
          isAdmin: true,
        }),
      );
    });
  });

  describe("getPencilBookingsSearch", () => {
    it("renders bookings page without name filter", async () => {
      const mockBookings = [
        { _id: "1", status: "booked", clientName: "Alice" },
        { _id: "2", status: "booked", clientName: "Bob" },
      ];
      Event.aggregate.mockResolvedValue(mockBookings);

      await eventController.getPencilBookingsSearch(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "booked" } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);
      expect(res.render).toHaveBeenCalledWith("event-tracker-pencilbookings", {
        bookings: mockBookings,
        search: undefined,
        username: "admin",
        isAdmin: true,
      });
    });

    it("filters bookings by client name", async () => {
      req.query.name = "Alice";

      const mockBookings = [
        { _id: "1", status: "booked", clientName: "Alice" },
        { _id: "2", status: "booked", clientName: "Bob" },
        { _id: "3", status: "reserved", clientName: "Alice" },
      ];
      Event.aggregate.mockResolvedValue(mockBookings);

      await eventController.getPencilBookingsSearch(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "booked", clientName: "Alice" } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);

      expect(res.render).toHaveBeenCalledWith("event-tracker-pencilbookings", {
        bookings: mockBookings,
        search: "Alice",
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("getReservations", () => {
    it("renders reservations page with reserved events", async () => {
      const mockReservations = [
        { _id: "1", status: "reserved", eventDate: new Date() },
        { _id: "2", status: "reserved", eventDate: new Date() },
      ];

      Event.aggregate.mockResolvedValue(mockReservations);

      await eventController.getReservations(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "reserved" } },
        { $sort: { eventDate: 1 } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);
      expect(res.render).toHaveBeenCalledWith("event-tracker-reservations", {
        reservations: mockReservations,
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("getReservationFilter", () => {
    it("renders reservations page", async () => {
      const mockReservations = [
        { _id: "1", status: "reserved", eventDate: new Date() },
        { _id: "2", status: "reserved", eventDate: new Date() },
      ];
      Event.aggregate.mockResolvedValue(mockReservations);

      await eventController.getReservationsFilter(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "reserved" } },
        { $sort: { eventDate: 1 } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);

      expect(res.render).toHaveBeenCalledWith("event-tracker-reservations", {
        reservations: mockReservations,
        venue: undefined,
        time: undefined,
        date: undefined,
        username: "admin",
        isAdmin: true,
      });
    });

    it("applies venue, time, date filters with descending sort", async () => {
      req.query = {
        venue: "Terrace",
        time: "14:00",
        date: "2025-11-18",
        sort: "date-dsc",
      };

      const mockReservations = [
        { _id: "1", status: "reserved", eventDate: new Date() },
        { _id: "2", status: "reserved", eventDate: new Date() },
      ];
      Event.aggregate.mockResolvedValue(mockReservations);

      await eventController.getReservationsFilter(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              status: "reserved",
              eventVenues: { $in: ["Terrace"] },
              eventTime: "14:00",
            }),
          }),
          expect.objectContaining({ $sort: { eventDate: -1 } }),
          expect.objectContaining({
            $lookup: expect.objectContaining({ from: "packages" }),
          }),
          expect.objectContaining({
            $lookup: expect.objectContaining({ from: "foods" }),
          }),
        ]),
      );
      expect(res.render).toHaveBeenCalledWith(
        "event-tracker-reservations",
        expect.objectContaining({
          reservations: mockReservations,
          venue: "Terrace",
          time: "14:00",
          date: "2025-11-18",
          username: "admin",
          isAdmin: true,
        }),
      );
    });
  });

  describe("getReservationsSearch", () => {
    it("renders reservation page without name filter", async () => {
      const mockReservations = [
        { _id: "1", status: "reserved", clientName: "Alice" },
        { _id: "2", status: "reserved", clientName: "Bob" },
      ];
      Event.aggregate.mockResolvedValue(mockReservations);

      await eventController.getReservationsSearch(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "reserved" } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);
      expect(res.render).toHaveBeenCalledWith("event-tracker-reservations", {
        reservations: mockReservations,
        search: undefined,
        username: "admin",
        isAdmin: true,
      });
    });

    it("filters reservations by client name", async () => {
      req.query.name = "Alice";

      const mockReservations = [
        { _id: "1", status: "reserved", clientName: "Alice" },
        { _id: "2", status: "reserved", clientName: "Bob" },
        { _id: "3", status: "booked", clientName: "Alice" },
      ];
      Event.aggregate.mockResolvedValue(mockReservations);

      await eventController.getReservationsSearch(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "reserved", clientName: "Alice" } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);

      expect(res.render).toHaveBeenCalledWith("event-tracker-reservations", {
        reservations: mockReservations,
        search: "Alice",
        username: "admin",
        isAdmin: true,
      });
    });
    it("filters reservations by employee username", async () => {
      req.query.name = "admin";

      const mockReservations = [
        { _id: "1", status: "reserved", clientName: "Alice" },
        { _id: "2", status: "reserved", clientName: "Bob" },
        { _id: "3", status: "booked", clientName: "Alice" },
      ];
      Event.aggregate.mockResolvedValue(mockReservations);

      await eventController.getReservationsSearch(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "reserved", clientName: "Alice" } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);

      expect(res.render).toHaveBeenCalledWith("event-tracker-reservations", {
        reservations: mockReservations,
        search: "Alice",
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("getCancelledEvents", () => {
    it("renders page with cancelled events", async () => {
      const mockCanceled = [
        { _id: "1", status: "cancelled", eventDate: new Date() },
        { _id: "2", status: "cancelled", eventDate: new Date() },
      ];

      Event.aggregate.mockResolvedValue(mockCanceled);

      await eventController.getCancelledEvents(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "cancelled" } },
        { $sort: { eventDate: 1 } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);
      expect(res.render).toHaveBeenCalledWith("event-tracker-cancelled", {
        cancelled: mockCanceled,
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("getCancelledEventsFilter", () => {
    it("renders cancelled events page", async () => {
      const mockCancelled = [
        { _id: "1", status: "cancelled", eventDate: new Date() },
        { _id: "2", status: "cancelled", eventDate: new Date() },
      ];
      Event.aggregate.mockResolvedValue(mockCancelled);

      await eventController.getCancelledEventsFilter(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "cancelled" } },
        { $sort: { eventDate: 1 } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);

      expect(res.render).toHaveBeenCalledWith("event-tracker-cancelled", {
        cancelled: mockCancelled,
        venue: undefined,
        time: undefined,
        date: undefined,
        username: "admin",
        isAdmin: true,
      });
    });

    it("applies venue, time, date filters with descending sort", async () => {
      req.query = {
        venue: "Terrace",
        time: "14:00",
        date: "2025-11-18",
        sort: "date-dsc",
      };

      const mockCancelled = [
        { _id: "1", status: "cancelled", eventDate: new Date() },
        { _id: "2", status: "cancelled", eventDate: new Date() },
      ];
      Event.aggregate.mockResolvedValue(mockCancelled);

      await eventController.getCancelledEventsFilter(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              status: "cancelled",
              eventVenues: { $in: ["Terrace"] },
              eventTime: "14:00",
            }),
          }),
          expect.objectContaining({ $sort: { eventDate: -1 } }),
          expect.objectContaining({
            $lookup: expect.objectContaining({ from: "packages" }),
          }),
          expect.objectContaining({
            $lookup: expect.objectContaining({ from: "foods" }),
          }),
        ]),
      );
      expect(res.render).toHaveBeenCalledWith(
        "event-tracker-cancelled",
        expect.objectContaining({
          cancelled: mockCancelled,
          venue: "Terrace",
          time: "14:00",
          date: "2025-11-18",
          username: "admin",
          isAdmin: true,
        }),
      );
    });
  });

  describe("getCancelledEventsSearch", () => {
    it("renders cancelled event page without name filter", async () => {
      const mockCancelled = [
        { _id: "1", status: "cancelled", clientName: "Alice" },
        { _id: "2", status: "cancelled", clientName: "Bob" },
      ];
      Event.aggregate.mockResolvedValue(mockCancelled);

      await eventController.getCancelledEventsSearch(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "cancelled" } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);
      expect(res.render).toHaveBeenCalledWith("event-tracker-cancelled", {
        cancelled: mockCancelled,
        search: undefined,
        username: "admin",
        isAdmin: true,
      });
    });

    it("filters cancelled events by client name", async () => {
      req.query.name = "Alice";

      const mockCancelled = [
        { _id: "1", status: "cancelled", clientName: "Alice" },
        { _id: "2", status: "cancelled", clientName: "Bob" },
        { _id: "3", status: "booked", clientName: "Alice" },
      ];
      Event.aggregate.mockResolvedValue(mockCancelled);

      await eventController.getCancelledEventsSearch(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "cancelled", clientName: "Alice" } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);

      expect(res.render).toHaveBeenCalledWith("event-tracker-cancelled", {
        cancelled: mockCancelled,
        search: "Alice",
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("getPastEvents", () => {
    it("renders page with finished events", async () => {
      const mockPast = [
        { _id: "1", status: "finished", eventDate: new Date() },
        { _id: "2", status: "finished", eventDate: new Date() },
      ];

      Event.aggregate.mockResolvedValue(mockPast);

      await eventController.getPastEvents(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "finished" } },
        { $sort: { eventDate: -1 } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);
      expect(res.render).toHaveBeenCalledWith("event-tracker-pastevents", {
        pastevents: mockPast,
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("getPastEventsFilter", () => {
    it("renders past events page", async () => {
      const mockPast = [
        { _id: "1", status: "finished", eventDate: new Date() },
        { _id: "2", status: "finished", eventDate: new Date() },
      ];
      Event.aggregate.mockResolvedValue(mockPast);

      await eventController.getPastEventsFilter(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "finished" } },
        { $sort: { eventDate: 1 } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);

      expect(res.render).toHaveBeenCalledWith("event-tracker-pastevents", {
        pastevents: mockPast,
        venue: undefined,
        time: undefined,
        date: undefined,
        username: "admin",
        isAdmin: true,
      });
    });

    it("applies venue, time, date filters with descending sort", async () => {
      req.query = {
        venue: "Terrace",
        time: "14:00",
        date: "2025-11-18",
        sort: "date-dsc",
      };

      const mockPast = [
        { _id: "1", status: "finished", eventDate: new Date() },
        { _id: "2", status: "finished", eventDate: new Date() },
      ];
      Event.aggregate.mockResolvedValue(mockPast);

      await eventController.getPastEventsFilter(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              status: "finished",
              eventVenues: { $in: ["Terrace"] },
              eventTime: "14:00",
            }),
          }),
          expect.objectContaining({ $sort: { eventDate: -1 } }),
          expect.objectContaining({
            $lookup: expect.objectContaining({ from: "packages" }),
          }),
          expect.objectContaining({
            $lookup: expect.objectContaining({ from: "foods" }),
          }),
        ]),
      );
      expect(res.render).toHaveBeenCalledWith(
        "event-tracker-pastevents",
        expect.objectContaining({
          pastevents: mockPast,
          venue: "Terrace",
          time: "14:00",
          date: "2025-11-18",
          username: "admin",
          isAdmin: true,
        }),
      );
    });
  });

  describe("getPastEventsSearch", () => {
    it("renders finished event page without name filter", async () => {
      const mockPast = [
        { _id: "1", status: "finished", clientName: "Alice" },
        { _id: "2", status: "finished", clientName: "Bob" },
      ];
      Event.aggregate.mockResolvedValue(mockPast);

      await eventController.getPastEventsSearch(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "finished" } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);
      expect(res.render).toHaveBeenCalledWith("event-tracker-pastevents", {
        pastevents: mockPast,
        search: undefined,
        username: "admin",
        isAdmin: true,
      });
    });

    it("filters finished events by client name", async () => {
      req.query.name = "Alice";

      const mockPast = [
        { _id: "1", status: "finished", clientName: "Alice" },
        { _id: "2", status: "finished", clientName: "Bob" },
        { _id: "3", status: "booked", clientName: "Alice" },
      ];
      Event.aggregate.mockResolvedValue(mockPast);

      await eventController.getPastEventsSearch(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { status: "finished", clientName: "Alice" } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);

      expect(res.render).toHaveBeenCalledWith("event-tracker-pastevents", {
        pastevents: mockPast,
        search: "Alice",
        username: "admin",
        isAdmin: true,
      });
    });
  });

  describe("getFood", () => {
    it("sends all food items with name and price", () => {
      const mockFood = [
        { name: "Pizza", price: 100 },
        { name: "Burger", price: 50 },
      ];

      db.findMany.mockImplementation((model, query, projection, callback) => {
        callback(mockFood);
      });

      eventController.getFood(req, res);

      expect(db.findMany).toHaveBeenCalledWith(
        Food,
        {},
        "name price",
        expect.any(Function),
      );
      expect(res.send).toHaveBeenCalledWith(mockFood);
    });
  });

  describe("getCharges", () => {
    it("sends all charges items with name and price", () => {
      const mockCharge = [
        { name: "Smth Fee", price: 100 },
        { name: "Another Fee", price: 50 },
      ];

      db.findMany.mockImplementation((model, query, projection, callback) => {
        callback(mockCharge);
      });

      eventController.getCharges(req, res);

      expect(db.findMany).toHaveBeenCalledWith(
        Charge,
        {},
        "name price",
        expect.any(Function),
      );
      expect(res.send).toHaveBeenCalledWith(mockCharge);
    });
  });

  describe("getPackages", () => {
    it("sends all packages", () => {
      const mockPackage = [
        { name: "1", price: 100 },
        { name: "2", price: 50 },
      ];

      db.findMany.mockImplementation((model, query, projection, callback) => {
        callback(mockPackage);
      });

      eventController.getPackages(req, res);

      expect(db.findMany).toHaveBeenCalledWith(
        Package,
        {},
        "",
        expect.any(Function),
      );
      expect(res.send).toHaveBeenCalledWith(mockPackage);
    });
  });

  describe("getCheckEventAvailability", () => {
    it("checks event availability and sends result", () => {
      req.query = {
        eventDate: "2025-11-18",
        eventTime: "10:00",
        eventVenues: ["Terrace", "Garden"],
      };
      const mockEvent = {
        _id: "1",
        eventDate: "2025-11-18",
        eventTime: "10:00",
        eventVenues: ["Terrace"],
        status: "booked",
      };

      db.findOne.mockImplementation((model, query, projection, callback) => {
        callback(mockEvent);
      });

      eventController.getCheckEventAvailability(req, res);

      expect(db.findOne).toHaveBeenCalledWith(
        Event,
        {
          eventDate: "2025-11-18",
          eventTime: "10:00",
          eventVenues: { $in: ["Terrace", "Garden"] },
        },
        "",
        expect.any(Function),
      );
      expect(res.send).toHaveBeenCalledWith(mockEvent);
    });

    it("returns null if no event is found", () => {
      db.findOne.mockImplementation((model, query, projection, callback) => {
        callback(null);
      });

      eventController.getCheckEventAvailability(req, res);

      expect(res.send).toHaveBeenCalledWith(null);
    });
  });

  describe("getEvent", () => {
    it("retrieves a specific event by ID", async () => {
      req.query = { id: "123" };
      const mockEvent = [
        {
          _id: "123",
          name: "Birthday Party",
          eventPackages: [],
          menuAdditional: { foodItem: [] },
        },
      ];

      Event.aggregate.mockResolvedValue(mockEvent);

      await eventController.getEvent(req, res);

      expect(Event.aggregate).toHaveBeenCalledWith([
        { $match: { _id: expect.any(Object) } },
        {
          $lookup: {
            from: "packages",
            localField: "eventPackages",
            foreignField: "_id",
            as: "packageList",
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "menuAdditional.foodItem",
            foreignField: "_id",
            as: "foodList",
          },
        },
      ]);
      expect(res.send).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe("getEventsInMonth", () => {
    it("renders calendar with events for the given month and year", async () => {
      req.params = { month: "11", year: "2025" };
      const mockEvents = [
        { _id: "1", status: "booked", eventDate: new Date("2025-11-05") },
        { _id: "2", status: "reserved", eventDate: new Date("2025-11-12") },
      ];

      const mockCalendarData = { bookings: mockEvents };

      const mockLean = jest.fn().mockResolvedValue(mockEvents);
      Event.find.mockReturnValue({
        lean: mockLean,
      });

      getEventsInMonth.mockReturnValue(mockCalendarData);

      await eventController.getEventsInMonth(req, res);

      expect(Event.find).toHaveBeenCalledWith({
        $expr: {
          $and: [
            { $ne: ["$status", "cancelled"] },
            { $ne: ["$status", "finished"] },
            { $eq: [2025, { $year: "$eventDate" }] },
            { $eq: [11, { $month: "$eventDate" }] },
          ],
        },
      });

      expect(getEventsInMonth).toHaveBeenCalledWith(
        "11",
        "2025",
        expect.arrayContaining([
          expect.objectContaining({
            _id: "1",
            status: "booked",
          }),
          expect.objectContaining({
            _id: "2",
            status: "reserved",
          }),
        ]),
      );
      expect(res.render).toHaveBeenCalledWith("event-tracker-calendar", {
        ...mockCalendarData,
        username: "admin",
        isAdmin: true,
      });
    });
  });
});
