const express = require('express');
const path = require('path');
const hbs = require('hbs');
const fs = require('fs');

const app = express();
const port = 3000; // Hardcoded port since no .env

// Set up Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Register partials
hbs.registerPartials(path.join(__dirname, 'views/partials'), (err) => {
  if (err) {
    console.error('Error registering partials:', err);
  } else {
    console.log('Partials registered successfully');
  }
});

// Load handlebars helpers
try {
  require('./views/hbs-helper.js');
  console.log('Helpers loaded successfully');
} catch (err) {
  console.error('Error loading helpers:', err);
}

// Parse incoming requests
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Mock data
const mockData = {
  'event-tracker-home': {
    title: 'Event Tracker Home',
    events: [
      {
        _id: 'event1',
        status: 'reserved',
        eventDate: new Date('2025-10-01'),
        name: 'Sample Event 1',
        location: 'Sample Venue',
        tags: ['Conference', 'Networking'],
        guests: ['John Doe', 'Jane Smith'],
        formatArray: ['Conference', 'Networking'],
        categories: ['Business'],
        attendees: ['John Doe', 'Jane Smith'],
        reasons: [],
        skills: [],
        items: [],
        eventType: ['Conference'],
        services: ['Catering', 'AV Setup'],
        keywords: ['Networking', 'Business'],
        participants: ['John Doe', 'Jane Smith'],
        eventVenues: ['Garden'],
        eventTime: 'Afternoon',
        clientName: 'John Doe',
        menuPackage: { saladName: 'Caesar Salad', saladQuantity: 10 },
        totalPrices: { packages: 1000, food: 200, charges: 0, discounts: 0, all: 1200 }
      },
      {
        _id: 'event2',
        status: 'booked',
        eventDate: new Date('2025-10-02'),
        name: 'Sample Event 2',
        location: 'Another Venue',
        tags: ['Workshop', 'Training'],
        guests: ['Alice Brown', 'Bob White'],
        formatArray: ['Workshop', 'Training'],
        categories: ['Education'],
        attendees: ['Alice Brown', 'Bob White'],
        reasons: [],
        skills: [],
        items: [],
        eventType: ['Workshop'],
        services: ['Training Materials'],
        keywords: ['Training', 'Education'],
        participants: ['Alice Brown', 'Bob White'],
        eventVenues: ['Sunroom'],
        eventTime: 'Evening',
        clientName: 'Alice Brown',
        menuPackage: { saladName: 'Greek Salad', saladQuantity: 15 },
        totalPrices: { packages: 1500, food: 300, charges: 0, discounts: 0, all: 1800 }
      },
      {
        _id: 'event3',
        status: 'cancelled',
        eventDate: new Date('2025-09-15'),
        name: 'Cancelled Event',
        location: 'Old Venue',
        tags: [],
        guests: [],
        formatArray: [],
        categories: [],
        attendees: [],
        reasons: ['Low Attendance'],
        skills: [],
        items: [],
        eventType: [],
        services: [],
        keywords: [],
        participants: [],
        eventVenues: ['Terrace'],
        eventTime: 'Afternoon',
        clientName: 'Unknown Client',
        menuPackage: { saladName: 'None', saladQuantity: 0 },
        totalPrices: { packages: 0, food: 0, charges: 0, discounts: 0, all: 0 }
      },
      {
        _id: 'event4',
        status: 'finished',
        eventDate: new Date('2025-09-01'),
        name: 'Past Event',
        location: 'Past Venue',
        tags: ['Completed'],
        guests: ['Guest 1'],
        formatArray: ['Completed'],
        categories: ['Community'],
        attendees: ['Guest 1'],
        reasons: [],
        skills: [],
        items: [],
        eventType: ['Community Event'],
        services: ['Venue Rental'],
        keywords: ['Community'],
        participants: ['Guest 1'],
        eventVenues: ['Garden'],
        eventTime: 'Evening',
        clientName: 'Guest 1',
        menuPackage: { saladName: 'Garden Salad', saladQuantity: 20 },
        totalPrices: { packages: 800, food: 150, charges: 0, discounts: 0, all: 950 }
      }
    ]
  },
  'login': {
    title: 'Login Page',
    formatArray: [],
    tags: [], guests: [], categories: [], attendees: [], reasons: [], skills: [], items: [], eventType: [], services: [], keywords: [], participants: []
  },
  'admin-home': {
    title: 'Admin Dashboard',
    employees: [
      { username: 'admin', role: 'admin', hasAccess: true, skills: ['Leadership', 'Planning'], formatArray: ['Leadership', 'Planning'], tags: [], guests: [], categories: [], attendees: [], reasons: [], items: [], eventType: [], services: [], keywords: [], participants: [] },
      { username: 'employee', role: 'employee', hasAccess: true, skills: ['Support', 'Coordination'], formatArray: ['Support', 'Coordination'], tags: [], guests: [], categories: [], attendees: [], reasons: [], items: [], eventType: [], services: [], keywords: [], participants: [] }
    ]
  },
  'event-tracker-calendar': {
    title: 'Event Calendar',
    events: [
      {
        _id: 'event1',
        status: 'reserved',
        eventDate: new Date('2025-10-01'),
        name: 'Sample Event',
        time: '10:00 AM',
        tags: ['Public'],
        formatArray: ['Public'],
        categories: [],
        attendees: [],
        guests: [],
        reasons: [],
        skills: [],
        items: [],
        eventType: ['Public Event'],
        services: ['AV Setup'],
        keywords: ['Public'],
        participants: [],
        eventVenues: ['Garden'],
        eventTime: 'Afternoon',
        clientName: 'John Doe',
        menuPackage: { saladName: 'Caesar Salad', saladQuantity: 10 },
        totalPrices: { packages: 1000, food: 200, charges: 0, discounts: 0, all: 1200 }
      }
    ]
  },
  'event-tracker-cancelled': {
    title: 'Cancelled Events',
    cancelled: [
      {
        _id: 'event3',
        status: 'cancelled',
        eventDate: new Date('2025-09-15'),
        name: 'Cancelled Event',
        reasons: ['Low Attendance'],
        formatArray: ['Low Attendance'],
        tags: [],
        guests: [],
        categories: [],
        attendees: [],
        skills: [],
        items: [],
        eventType: [],
        services: [],
        keywords: [],
        participants: [],
        eventVenues: ['Terrace'],
        eventTime: 'Afternoon',
        clientName: 'Unknown Client',
        menuPackage: { saladName: 'None', saladQuantity: 0 },
        totalPrices: { packages: 0, food: 0, charges: 0, discounts: 0, all: 0 }
      }
    ]
  },
  'event-tracker-form': {
    title: 'Create Event',
    options: ['Option 1', 'Option 2'],
    formatArray: ['Option 1', 'Option 2'],
    tags: [], guests: [], categories: [], attendees: [], reasons: [], skills: [], items: [], eventType: [], services: [], keywords: [], participants: []
  },
  'event-tracker-pastevents': {
    title: 'Past Events',
    pastevents: [
      {
        _id: 'event4',
        status: 'finished',
        eventDate: new Date('2025-09-01'),
        name: 'Past Event',
        tags: ['Completed'],
        formatArray: ['Completed'],
        categories: [],
        attendees: [],
        guests: [],
        reasons: [],
        skills: [],
        items: [],
        eventType: ['Community Event'],
        services: [],
        keywords: [],
        participants: [],
        eventVenues: ['Garden'],
        eventTime: 'Evening',
        clientName: 'Guest 1',
        menuPackage: { saladName: 'Garden Salad', saladQuantity: 20 },
        totalPrices: { packages: 800, food: 150, charges: 0, discounts: 0, all: 950 }
      }
    ]
  },
  'event-tracker-pencilbookings': {
    title: 'Pencil Bookings',
    bookings: [
      {
        _id: 'event5',
        status: 'reserved',
        eventDate: new Date('2025-10-05'),
        name: 'Pencil Booking',
        attendees: ['Client A'],
        formatArray: ['Client A'],
        tags: [],
        guests: [],
        categories: [],
        reasons: [],
        skills: [],
        items: [],
        eventType: [],
        services: [],
        keywords: [],
        participants: [],
        eventVenues: ['Sunroom'],
        eventTime: 'Afternoon',
        clientName: 'Client A',
        menuPackage: { saladName: 'Caesar Salad', saladQuantity: 12 },
        totalPrices: { packages: 1200, food: 250, charges: 0, discounts: 0, all: 1450 }
      }
    ]
  },
  'event-tracker-receipt': {
    title: 'Receipt',
    receipt: {
      _id: 'event1',
      id: '123',
      amount: 1200,
      date: '2025-09-30',
      items: ['Service Fee'],
      formatArray: ['Service Fee'],
      tags: [],
      guests: [],
      categories: [],
      attendees: [],
      reasons: [],
      skills: [],
      eventType: [],
      services: [],
      keywords: [],
      participants: [],
      eventVenues: ['Garden'],
      eventTime: 'Afternoon',
      clientName: 'John Doe',
      menuPackage: { saladName: 'Caesar Salad', saladQuantity: 10 },
      totalPrices: { packages: 1000, food: 200, charges: 0, discounts: 0, all: 1200 }
    }
  },
  'event-tracker-reservations': {
    title: 'Reservations',
    reservations: [
      {
        _id: 'event1',
        status: 'reserved',
        eventDate: new Date('2025-10-10'),
        name: 'Reservation 1',
        guests: ['Guest 1'],
        formatArray: ['Guest 1'],
        tags: [],
        categories: [],
        attendees: [],
        reasons: [],
        skills: [],
        items: [],
        eventType: [],
        services: [],
        keywords: [],
        participants: [],
        eventVenues: ['Terrace'],
        eventTime: 'Evening',
        clientName: 'John Doe',
        menuPackage: { saladName: 'Greek Salad', saladQuantity: 15 },
        totalPrices: { packages: 1500, food: 300, charges: 0, discounts: 0, all: 1800 }
      }
    ]
  },
  'event-tracker-settings': {
    title: 'Settings',
    preferences: ['Email Notifications', 'Dark Mode'],
    formatArray: ['Email Notifications', 'Dark Mode'],
    tags: [], guests: [], categories: [], attendees: [], reasons: [], skills: [], items: [], eventType: [], services: [], keywords: [], participants: []
  },
  'admin-register': {
    title: 'Register Employee',
    formatArray: [],
    tags: [], guests: [], categories: [], attendees: [], reasons: [], skills: [], items: [], eventType: [], services: [], keywords: [], participants: []
  }
};

// Generate calendar eventArray
function generateEventArray(year, month, events) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const firstDay = startDate.getDay();
  const daysInMonth = endDate.getDate();
  const eventArray = [[], [], [], [], [], []];
  let currentDay = 1 - firstDay;
  for (let week = 0; week < 6; week++) {
    for (let day = 0; day < 7; day++) {
      if (currentDay > 0 && currentDay <= daysInMonth) {
        const dayEvents = events.filter(event => {
          const eventDate = new Date(event.eventDate);
          return eventDate.getDate() === currentDay &&
                 eventDate.getMonth() + 1 === parseInt(month) &&
                 eventDate.getFullYear() === parseInt(year);
        });
        eventArray[week].push({
          day: currentDay,
          event: dayEvents.length > 0 ? dayEvents : [],
          aftGar: dayEvents.some(e => e.eventVenues?.includes('Garden') && e.eventTime === 'Afternoon'),
          aftSun: dayEvents.some(e => e.eventVenues?.includes('Sunroom') && e.eventTime === 'Afternoon'),
          aftTer: dayEvents.some(e => e.eventVenues?.includes('Terrace') && e.eventTime === 'Afternoon'),
          eveGar: dayEvents.some(e => e.eventVenues?.includes('Garden') && e.eventTime === 'Evening'),
          eveSun: dayEvents.some(e => e.eventVenues?.includes('Sunroom') && e.eventTime === 'Evening'),
          eveTer: dayEvents.some(e => e.eventVenues?.includes('Terrace') && e.eventTime === 'Evening')
        });
      } else {
        eventArray[week].push({});
      }
      currentDay++;
    }
  }
  return eventArray;
}

// Routes
app.get('/', (req, res) => {
  console.log('Handling /');
  res.redirect('/event-tracker/home');
});

app.get('/login', (req, res) => {
  console.log('Handling /login');
  const template = 'login';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.get('/logout', (req, res) => {
  console.log('Handling /logout');
  res.redirect('/login');
});

app.post('/authenticate', (req, res) => {
  console.log('Handling /authenticate');
  res.redirect('/event-tracker/home');
});

app.get('/admin', (req, res) => {
  console.log('Handling /admin');
  const template = 'admin-home';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.get('/admin/register', (req, res) => {
  console.log('Handling /admin/register');
  const template = 'admin-register';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.post('/admin/register', (req, res) => {
  console.log('Handling POST /admin/register');
  res.redirect('/admin');
});

app.get('/admin/employee', (req, res) => {
  console.log('Handling /admin/employee');
  res.render('admin-home', mockData['admin-home']);
});

app.get('/admin/employee/current', (req, res) => {
  console.log('Handling /admin/employee/current');
  res.render('admin-home', { ...mockData['admin-home'], employees: mockData['admin-home'].employees.filter(e => e.hasAccess) });
});

app.get('/admin/employee/former', (req, res) => {
  console.log('Handling /admin/employee/former');
  res.render('admin-home', { ...mockData['admin-home'], employees: mockData['admin-home'].employees.filter(e => !e.hasAccess) });
});

app.get('/admin/employee/:id', (req, res) => {
  console.log(`Handling /admin/employee/${req.params.id}`);
  const employee = mockData['admin-home'].employees.find(e => e.username === req.params.id) || {};
  res.render('admin-home', { ...mockData['admin-home'], employee });
});

app.put('/admin/employee/:username', (req, res) => {
  console.log(`Handling PUT /admin/employee/${req.params.username}`);
  res.json({ success: true });
});

app.get('/admin/activity/:username', (req, res) => {
  console.log(`Handling /admin/activity/${req.params.username}`);
  res.render('admin-home', { ...mockData['admin-home'], activity: [] });
});

app.put('/admin/give', (req, res) => {
  console.log('Handling PUT /admin/give');
  res.json({ success: true });
});

app.put('/admin/remove', (req, res) => {
  console.log('Handling PUT /admin/remove');
  res.json({ success: true });
});

app.get('/admin/activity/recent', (req, res) => {
  console.log('Handling /admin/activity/recent');
  res.render('admin-home', { ...mockData['admin-home'], activity: [] });
});

app.get('/settings/event', (req, res) => {
  console.log('Handling /settings/event');
  res.render('event-tracker-settings', mockData['event-tracker-settings']);
});

app.get('/settings/event/discount', (req, res) => {
  console.log('Handling /settings/event/discount');
  res.render('event-tracker-settings', { ...mockData['event-tracker-settings'], discounts: [] });
});

app.post('/settings/event/discount', (req, res) => {
  console.log('Handling POST /settings/event/discount');
  res.redirect('/settings/event');
});

app.get('/event-tracker/home', (req, res) => {
  console.log('Handling /event-tracker/home');
  const template = 'event-tracker-home';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.get('/event-tracker/create', (req, res) => {
  console.log('Handling /event-tracker/create');
  const template = 'event-tracker-form';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.post('/event-tracker/submit', (req, res) => {
  console.log('Handling POST /event-tracker/submit');
  res.redirect('/event-tracker/home');
});

app.get('/event-tracker/edit/:id', (req, res) => {
  console.log(`Handling /event-tracker/edit/${req.params.id}`);
  const template = 'event-tracker-form';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  const event = mockData['event-tracker-home'].events.find(e => e._id === req.params.id) || {};
  res.render(template, { ...mockData[template], event });
});

app.put('/event-tracker/cancel', (req, res) => {
  console.log('Handling PUT /event-tracker/cancel');
  res.json({ success: true });
});

app.get('/event-tracker/print/:id', (req, res) => {
  console.log(`Handling /event-tracker/print/${req.params.id}`);
  const template = 'event-tracker-receipt';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  const event = mockData['event-tracker-home'].events.find(e => e._id === req.params.id) || {};
  res.render(template, { ...mockData[template], receipt: event });
});

app.put('/event-tracker/finish', (req, res) => {
  console.log('Handling PUT /event-tracker/finish');
  res.json({ success: true });
});

app.get('/event-tracker/get/food', (req, res) => {
  console.log('Handling /event-tracker/get/food');
  res.json({ food: ['Caesar Salad', 'Greek Salad'] });
});

app.get('/event-tracker/get/event', (req, res) => {
  console.log('Handling /event-tracker/get/event');
  res.json(mockData['event-tracker-home'].events);
});

app.get('/event-tracker/get/charges', (req, res) => {
  console.log('Handling /event-tracker/get/charges');
  res.json({ charges: [] });
});

app.get('/event-tracker/get/packages', (req, res) => {
  console.log('Handling /event-tracker/get/packages');
  res.json({ packages: ['Basic', 'Premium'] });
});

app.get('/event-tracker/check/event-availability', (req, res) => {
  console.log('Handling /event-tracker/check/event-availability');
  res.json({ available: true });
});

app.get('/event-tracker/calendar/:year/:month', (req, res) => {
  console.log(`Handling /event-tracker/calendar/${req.params.year}/${req.params.month}`);
  const template = 'event-tracker-calendar';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    console.error(`Invalid year or month: ${req.params.year}/${req.params.month}`);
    return res.status(400).send('Invalid year or month');
  }
  const currMonthYear = new Date(year, month - 1, 1);
  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
  const updatedEvents = mockData[template].events.map(event => ({
    ...event,
    eventTime: event.time?.includes('AM') ? 'Afternoon' : 'Evening',
    eventVenues: event.eventVenues || [event.location || 'Unknown'],
    clientName: event.clientName || event.name || 'Unknown Client'
  }));
  const eventArray = generateEventArray(year, month, updatedEvents);
  res.render(template, {
    ...mockData[template],
    currMonthYear,
    currMonthName: monthNames[month - 1],
    currYear: year,
    eventArray
  });
});

app.get('/event-tracker/pencilbookings', (req, res) => {
  console.log('Handling /event-tracker/pencilbookings');
  const template = 'event-tracker-pencilbookings';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.put('/event-tracker/pencilbookings', (req, res) => {
  console.log('Handling PUT /event-tracker/pencilbookings');
  res.json({ success: true });
});

app.get('/event-tracker/pencilbookings/search', (req, res) => {
  console.log(`Handling /event-tracker/pencilbookings/search?name=${req.query.name}`);
  const template = 'event-tracker-pencilbookings';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  const searchQuery = req.query.name || '';
  const filteredBookings = searchQuery
    ? mockData[template].bookings.filter(booking =>
        booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockData[template].bookings;
  res.render(template, { ...mockData[template], bookings: filteredBookings, search: searchQuery });
});

app.get('/event-tracker/pencilbookings/filter', (req, res) => {
  console.log('Handling /event-tracker/pencilbookings/filter');
  const template = 'event-tracker-pencilbookings';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.get('/event-tracker/reservations', (req, res) => {
  console.log('Handling /event-tracker/reservations');
  const template = 'event-tracker-reservations';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.put('/event-tracker/reservations', (req, res) => {
  console.log('Handling PUT /event-tracker/reservations');
  res.json({ success: true });
});

app.get('/event-tracker/reservations/search', (req, res) => {
  console.log(`Handling /event-tracker/reservations/search?name=${req.query.name}`);
  const template = 'event-tracker-reservations';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  const searchQuery = req.query.name || '';
  const filteredReservations = searchQuery
    ? mockData[template].reservations.filter(event =>
        event.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockData[template].reservations;
  res.render(template, { ...mockData[template], reservations: filteredReservations, search: searchQuery });
});

app.get('/event-tracker/reservations/filter', (req, res) => {
  console.log('Handling /event-tracker/reservations/filter');
  const template = 'event-tracker-reservations';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.get('/event-tracker/pastevents', (req, res) => {
  console.log('Handling /event-tracker/pastevents');
  const template = 'event-tracker-pastevents';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.get('/event-tracker/pastevents/search', (req, res) => {
  console.log(`Handling /event-tracker/pastevents/search?name=${req.query.name}`);
  const template = 'event-tracker-pastevents';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  const searchQuery = req.query.name || '';
  const filteredPastEvents = searchQuery
    ? mockData[template].pastevents.filter(event =>
        event.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockData[template].pastevents;
  res.render(template, { ...mockData[template], pastevents: filteredPastEvents, search: searchQuery });
});

app.get('/event-tracker/pastevents/filter', (req, res) => {
  console.log('Handling /event-tracker/pastevents/filter');
  const template = 'event-tracker-pastevents';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.get('/event-tracker/cancelled', (req, res) => {
  console.log('Handling /event-tracker/cancelled');
  const template = 'event-tracker-cancelled';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

app.get('/event-tracker/cancelled/search', (req, res) => {
  console.log(`Handling /event-tracker/cancelled/search?name=${req.query.name}`);
  const template = 'event-tracker-cancelled';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  const searchQuery = req.query.name || '';
  const filteredCancelled = searchQuery
    ? mockData[template].cancelled.filter(event =>
        event.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockData[template].cancelled;
  res.render(template, { ...mockData[template], cancelled: filteredCancelled, search: searchQuery });
});

app.get('/event-tracker/cancelled/filter', (req, res) => {
  console.log('Handling /event-tracker/cancelled/filter');
  const template = 'event-tracker-cancelled';
  const templatePath = path.join(__dirname, 'views', `${template}.hbs`);
  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    return res.status(404).send(`Template ${template}.hbs not found`);
  }
  res.render(template, mockData[template]);
});

// Serve static files (after routes)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route for unmatched routes
app.use((req, res) => {
  console.error(`Route not found: ${req.originalUrl}`);
  res.status(404).send(`Page not found: ${req.originalUrl}`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});