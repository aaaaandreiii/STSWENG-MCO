const { Calendar } = require("calendar");

function getEventsInMonth(month, year, events) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentDate = new Date(`${year}-${month}-01`);
  const calendarObj = new Calendar();
  const calendarArray = calendarObj.monthDays(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );
  const eventArray = [];

  calendarArray.forEach((week) => {
    const weekArray = [];

    week.forEach((day) => {
      if (day === 0) {
        var eventItem = {
          day: "",
        };
      } else {
        const eventsPerDay = getEventsPerDay(events, day);
        const venuesAvailability = getVenuesAvailability(eventsPerDay);
        var eventItem = {
          day: day.toString().padStart(2, "0"),
          event: eventsPerDay,
          ...venuesAvailability,
        };
      }
      weekArray.push(eventItem);
    });

    eventArray.push(weekArray);
  });

  const eventsInMonth = {
    eventArray: eventArray,
    currMonthNum: month,
    currMonthName: monthNames[month - 1],
    currYear: year,
    currMonthYear: currentDate,
    today: new Date(),
  };

  return eventsInMonth;
}

function getEventsPerDay(events, day) {
  const eventsPerDay = events.filter(
    (event) => new Date(event.eventDate).getDate() === day,
  );
  return eventsPerDay;
}

function getVenuesAvailability(eventsPerDay) {
  const venueAvailabilityChecker = {
    aftGar: false,
    aftSun: false,
    aftTer: false,
    eveGar: false,
    eveSun: false,
    eveTer: false,
  };

  eventsPerDay.forEach((event) => {
    let key = "";
    switch (event.eventTime) {
      case "Afternoon":
        key += "aft";
        break;
      case "Evening":
        key += "eve";
        break;
    }

    event.eventVenues.forEach((takenVenue) => {
      switch (takenVenue) {
        case "Garden":
          key += "Gar";
          break;
        case "Sunroom":
          key += "Sun";
          break;
        case "Terrace":
          key += "Ter";
          break;
      }
      venueAvailabilityChecker[key] = true;
      key = key.slice(0, 3);
    });
  });

  return venueAvailabilityChecker;
}

module.exports = getEventsInMonth;
