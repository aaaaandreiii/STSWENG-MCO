const express = require("express");

const authController = require("../controllers/auth-controller.js");
const adminController = require("../controllers/admin-controller.js");
const eventController = require("../controllers/event-controller.js");

const { loginLimiter } = require("../middleware/rate-limiters.js");
const { ensureAuthenticated } = require("../middleware/auth.js");
const { requireRoles } = require("../middleware/rbac.js");

const analyticsController = require("../controllers/analytics-controller.js");

const profileController = require("../controllers/profile-controller.js");

const app = express.Router();

// login
app.get("/", (req, res) => {
  res.redirect("/event-tracker/home");
});
app.get("/login", authController.getLogin);
app.get("/logout", authController.getLogout);

// authenticate user
app.post(
  "/authenticate", 
  loginLimiter, 
  authController.authenticate
);

// admin
app.get(
  "/admin",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.getAdminHome,
);

app.get(
  "/admin/register",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.getRegisterEmployee,
);

app.post(
  "/admin/register",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.postRegisterEmployee,
);

app.get(
  "/admin/employee",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.getAllEmployees,
);

app.get(
  "/admin/employee/current",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.getAllCurrentEmployees,
);

app.get(
  "/admin/employee/former",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.getAllFormerEmployees,
);

app.get(
  "/admin/employee/:id",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.getEmployee,
);

app.put(
  "/admin/employee/:username",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.putEmployeeInfo,
);

app.get(
  "/admin/activity/:username",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.getEmployeeActivity,
);

app.put(
  "/admin/give",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.putGiveEmployeeAccess,
);

app.put(
  "/admin/remove",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.putRemoveEmployeeAccess,
);

app.get(
  "/admin/activity/recent",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.getRecentActivity,
);

//settings
app.get(
  "/settings/event",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.getEventSettings,
);

app.get(
  "/settings/event/discount",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.getDiscounts,
);

app.post(
  "/settings/event/discount",
  ensureAuthenticated,
  requireRoles(["admin"]),
  adminController.postRegisterDiscount,
);

// event-tracker home
app.get(
  "/event-tracker/home",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getHome,
);

// app.get('/event-tracker/form',
//   ensureAuthenticated,
//   requireRoles(['admin', 'manager', 'frontdesk']),
//   eventController.getCreateForm,
// );

app.post(
  "/event-tracker/form",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.postCreateEvent,
);

// event-tracker form
app.get(
  "/event-tracker/create",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getCreateEvent,
);

app.post(
  "/event-tracker/submit",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.postCreateEvent,
);

app.get(
  "/event-tracker/edit/:id",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getEditEvent,
);

app.put(
  "/event-tracker/cancel",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.putCancelEvent,
);

app.get(
  "/event-tracker/print/:id",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getPrintEvent,
);

app.put(
  "/event-tracker/finish",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.putFinishEvent,
);

// event-tracker form data retrieval
app.get(
  "/event-tracker/get/food",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getFood,
);

app.get(
  "/event-tracker/get/event",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getEvent,
);

app.get(
  "/event-tracker/get/charges",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getCharges,
);
app.get(
  "/event-tracker/get/packages",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getPackages,
);
app.get(
  "/event-tracker/check/event-availability",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getCheckEventAvailability,
);

// event-tracker calendar
app.get(
  "/event-tracker/calendar/:year/:month",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getEventsInMonth,
);

// event-tracker pencilbooking list
app
  .route("/event-tracker/pencilbookings")
  .get(
    ensureAuthenticated,
    requireRoles(["admin", "manager", "frontdesk"]),
    eventController.getPencilBookings,
  )
  .put(
    ensureAuthenticated,
    requireRoles(["admin", "manager", "frontdesk"]),
    eventController.putPencilbookings,
  );
app.get(
  "/event-tracker/pencilbookings/search",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getPencilBookingsSearch,
);
app.get(
  "/event-tracker/pencilbookings/filter",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getPencilBookingsFilter,
);

// event-tracker reservation list
app
  .route("/event-tracker/reservations")
  .get(
    ensureAuthenticated,
    requireRoles(["admin", "manager", "frontdesk"]),
    eventController.getReservations,
  )
  .put(
    ensureAuthenticated,
    requireRoles(["admin", "manager", "frontdesk"]),
    eventController.putReservations,
  );
app.get(
  "/event-tracker/reservations/search",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getReservationsSearch,
);
app.get(
  "/event-tracker/reservations/filter",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getReservationsFilter,
);

// event-tracker past events list
app.get(
  "/event-tracker/pastevents",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getPastEvents,
);

app.get(
  "/event-tracker/pastevents/search",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getPastEventsSearch,
);

app.get(
  "/event-tracker/pastevents/filter",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getPastEventsFilter,
);

// event-tracker cancelled events list
app.get(
  "/event-tracker/cancelled",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getCancelledEvents,
);

app.get(
  "/event-tracker/cancelled/search",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getCancelledEventsSearch,
);
app.get(
  "/event-tracker/cancelled/filter",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getCancelledEventsFilter,
);

// event-tracker past events list
app.get(
  "/event-tracker/pastevents",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getPastEvents,
);
app.get(
  "/event-tracker/pastevents/search",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getPastEventsSearch,
);
app.get(
  "/event-tracker/pastevents/filter",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  eventController.getPastEventsFilter,
);

//analytics
app.get(
  "/analytics",
  ensureAuthenticated,
  requireRoles(["admin", "manager"]),
  analyticsController.getAnalyticsDashboard,
);

//profile
app.get(
  "/profile",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  profileController.getProfile,
);

app.post(
  "/profile",
  ensureAuthenticated,
  requireRoles(["admin", "manager", "frontdesk"]),
  profileController.updateProfile,
);

module.exports = app;
