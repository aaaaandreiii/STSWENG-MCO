const express = require('express');

const authController = require('../controllers/auth-controller.js');
const adminController = require('../controllers/admin-controller.js');
const eventController = require('../controllers/event-controller.js');
const app = express.Router();

// login
app.get('/', (req, res) => {
    res.redirect('/event-tracker/home');
});
app.get('/login', authController.getLogin);
app.get('/logout', authController.getLogout);

// authenticate user
app.post('/authenticate', authController.authenticate);

// admin
app.get('/admin', adminController.getAdminHome);
app.get('/admin/register', adminController.getRegisterEmployee);
app.post('/admin/register', adminController.postRegisterEmployee);
app.get('/admin/employee', adminController.getAllEmployees);
app.get('/admin/employee/current', adminController.getAllCurrentEmployees);
app.get('/admin/employee/former', adminController.getAllFormerEmployees);
app.get('/admin/employee/:id', adminController.getEmployee);
app.put('/admin/employee/:username', adminController.putEmployeeInfo);
app.get('/admin/activity/:username', adminController.getEmployeeActivity);
app.put('/admin/give', adminController.putGiveEmployeeAccess);
app.put('/admin/remove', adminController.putRemoveEmployeeAccess);
app.get('/admin/activity/recent', adminController.getRecentActivity);

app.get('/settings/event', adminController.getEventSettings);
app.get('/settings/event/discount', adminController.getDiscounts);
app.post('/settings/event/discount', adminController.postRegisterDiscount);

// event-tracker home
app.get('/event-tracker/home', eventController.getHome);

// event-tracker form
app.get('/event-tracker/create', eventController.getCreateEvent);
app.post('/event-tracker/submit', eventController.postCreateEvent);
app.get('/event-tracker/edit/:id', eventController.getEditEvent);
app.put('/event-tracker/cancel', eventController.putCancelEvent);
app.get('/event-tracker/print/:id', eventController.getPrintEvent);
app.put('/event-tracker/finish', eventController.putFinishEvent);

// event-tracker form data retrieval
app.get('/event-tracker/get/food', eventController.getFood);
app.get('/event-tracker/get/event', eventController.getEvent);
app.get('/event-tracker/get/charges', eventController.getCharges);
app.get('/event-tracker/get/packages', eventController.getPackages);
app.get(
    '/event-tracker/check/event-availability',
    eventController.getCheckEventAvailability
);

// event-tracker calendar
app.get(
    '/event-tracker/calendar/:year/:month',
    eventController.getEventsInMonth
);

// event-tracker pencilbooking list
app.route('/event-tracker/pencilbookings')
    .get(eventController.getPencilBookings)
    .put(eventController.putPencilbookings);
app.get(
    '/event-tracker/pencilbookings/search',
    eventController.getPencilBookingsSearch
);
app.get(
    '/event-tracker/pencilbookings/filter',
    eventController.getPencilBookingsFilter
);

// event-tracker reservation list
app.route('/event-tracker/reservations')
    .get(eventController.getReservations)
    .put(eventController.putReservations);
app.get(
    '/event-tracker/reservations/search',
    eventController.getReservationsSearch
);
app.get(
    '/event-tracker/reservations/filter',
    eventController.getReservationsFilter
);

// event-tracker past events list
app.get('/event-tracker/pastevents', eventController.getPastEvents);
app.get(
    '/event-tracker/pastevents/search',
    eventController.getPastEventsSearch
);
app.get(
    '/event-tracker/pastevents/filter',
    eventController.getPastEventsFilter
);

// event-tracker cancelled events list
app.get('/event-tracker/cancelled', eventController.getCancelledEvents);
app.get(
    '/event-tracker/cancelled/search',
    eventController.getCancelledEventsSearch
);
app.get(
    '/event-tracker/cancelled/filter',
    eventController.getCancelledEventsFilter
);

// event-tracker past events list
app.get('/event-tracker/pastevents', eventController.getPastEvents);
app.get(
    '/event-tracker/pastevents/search',
    eventController.getPastEventsSearch
);
app.get(
    '/event-tracker/pastevents/filter',
    eventController.getPastEventsFilter
);

module.exports = app;
