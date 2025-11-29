const getEventsInMonth = require("../helpers/eventsInMonth.js");

describe("eventsInMonth", () => {
  let events;
  let result;
  beforeEach(() => {
    //mock events data
    events = [
      {
        eventDate: '2025-11-05',
        eventTime: "Afternoon",
        eventVenues: ["Garden", "Sunroom"],
      },
      {
        eventDate: "2025-11-05",
        eventTime: "Evening",
        eventVenues: ["Terrace"],
      },
      {
        eventDate: "2025-11-10",
        eventTime: "Afternoon",
        eventVenues: ["Terrace"],
      },
    ];
    result = getEventsInMonth(11, 2025, events); //month, year
  });

  it("returns events in a month", () => {
    expect(result.currMonthNum).toBe(11);
    expect(result.currMonthName).toBe("November");
    expect(result.currYear).toBe(2025);
    expect(result.eventArray).toBeInstanceOf(Array);
  });

  //describe("getEventsPerDay and getVenuesAvailability", () => {
  it("returns correct events and venue availability for a day with multiple events", () => {
    const day5 = result.eventArray.flat().find((d) => d.day === "05");

    expect(day5.event.length).toBe(2);
    expect(day5.aftGar).toBe(true);
    expect(day5.aftSun).toBe(true);
    expect(day5.eveTer).toBe(true);
    //Unaffected venue remain false
    expect(day5.eveGar).toBe(false);
    expect(day5.eveSun).toBe(false);
    expect(day5.aftTer).toBe(false);
  });

  it("returns correct events and venue availability for a day with single events", () => {
    const day5 = result.eventArray.flat().find((d) => d.day === "10");

    expect(day5.event.length).toBe(1);
    expect(day5.aftGar).toBe(false);
    expect(day5.aftSun).toBe(false);
    expect(day5.eveTer).toBe(false);
    expect(day5.eveGar).toBe(false);
    expect(day5.eveSun).toBe(false);

    expect(day5.aftTer).toBe(true);
  });
  //Check a day without events
  it("handles days with no events", () => {
    const day1 = result.eventArray.flat().find((d) => d.day === "01");

    expect(day1.event).toEqual([]);
    expect(day1.aftGar).toBe(false);
    expect(day1.aftSun).toBe(false);
    expect(day1.aftTer).toBe(false);
    expect(day1.eveGar).toBe(false);
    expect(day1.eveSun).toBe(false);
    expect(day1.eveTer).toBe(false);
  });
  //   });

  //   describe("empty event array", () => {
  it("no events", () => {
    empty = getEventsInMonth(11, 2025, []);

    const day5 = empty.eventArray.flat().find((d) => d.day === "05");
    expect(day5.event).toEqual([]);
    expect(day5.aftGar).toBe(false);
    expect(day5.aftSun).toBe(false);
    expect(day5.aftTer).toBe(false);
    expect(day5.eveGar).toBe(false);
    expect(day5.eveSun).toBe(false);
    expect(day5.eveTer).toBe(false);
  });
  // });
});
