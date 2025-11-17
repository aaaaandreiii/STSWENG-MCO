// seed.js — generates 50+ valid, interconnected MongoDB Extended JSON docs per model.
// No external deps. Prints eight JSON arrays: Activity, Charge, Discount, Employee, Food, Package, Event, Transaction.
// Usage: node seed.js

"use strict";

// -------- helpers --------
const hex = "abcdef0123456789";
function oid(seed) {
  // deterministic 24-hex
  let s = "";
  let x = (seed >>> 0) + 0x9e3779b9;
  for (let i = 0; i < 24; i++) {
    x = (x * 1664525 + 1013904223) >>> 0;
    s += hex[x & 15];
  }
  return s;
}
function d(year, month1to12, day, hour = 0) {
  // month1to12 = 1..12
  const dt = new Date(Date.UTC(year, month1to12 - 1, day, hour, 0, 0));
  return { $date: dt.toISOString().replace(".000Z", ".000Z") };
}
function range(n) {
  return Array.from({ length: n }, (_, i) => i + 1);
}

// -------- settings --------
const N = 50;
const venues = ["Hall A", "Hall B", "Garden", "Beachfront", "Ballroom"];
const eventTypes = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Reunion",
  "Christening",
];
const statuses = ["booked", "reserved", "finished", "cancelled"];

// -------- Employee (50) --------
const Employees = range(N).map((i) => ({
  username: `user${String(i).padStart(3, "0")}`,
  password: `pass${String(i).padStart(3, "0")}`,
  hasAccess: i % 11 !== 0,
  role: i <= 5 ? "admin" : "employee",
  name: `Employee ${String(i).padStart(3, "0")}`,
  contactNum: `0917${String(1000000 + i).padStart(7, "0")}`.slice(-11),
  emergencyContactName: `EC ${String(i).padStart(3, "0")}`,
  emergencyContactNum: `0999${String(2000000 + i).padStart(7, "0")}`.slice(-11),
  dateRegistered: d(2024, 9, Math.min(28, i)),
}));

// -------- Charge (50) --------
const Charges = range(N).map((i) => ({
  name: `Charge ${String(i).padStart(2, "0")}`,
  price: 100 * ((i % 15) + 1),
}));

// -------- Discount (50) --------
const Discounts = range(N).map((i) => ({
  description: `Discount ${String(i).padStart(2, "0")}`,
  rate: Number((0.02 + (i % 15) * 0.01).toFixed(2)), // 2%..16%
  minimumPax: 20 + (i % 30),
}));

// --- replace the old oid() helper with this ---
const { randomBytes } = require("crypto");
const usedOids = new Set();
function newOid() {
  let h;
  do {
    h = randomBytes(12).toString("hex");
  } while (usedOids.has(h));
  usedOids.add(h);
  return h; // 24-hex string, safe for {"$oid": ...}
}

// -------- Food (50) with unique _id --------
const Foods = range(N).map((i) => ({
  _id: { $oid: newOid() },
  name: `Food ${String(i).padStart(2, "0")}`,
  price: 50 * ((i % 20) + 1),
}));

// quick lookup
const FoodByIdx = (i) => Foods[(i - 1) % Foods.length];

// -------- Package (50) with unique _id --------
const Packages = range(N).map((i) => ({
  _id: { $oid: newOid() },
  packageCode: `PKG${String(i).padStart(3, "0")}`,
  packageName: `Package ${String(i).padStart(3, "0")}`,
  packagePrice: 5000 + 250 * i,
  packageVenue: venues[i % venues.length],
  variantCount: 2 + (i % 3),
  foodQuantities: [10, 20, 30].slice(0, 2 + (i % 3)), // length 2..3
}));

const PackageByIdx = (i) => Packages[(i - 1) % Packages.length];

// -------- Activity (50) referencing Employee.usernames --------
const Activities = range(N).map((i) => {
  const u = Employees[(i - 1) % Employees.length].username;
  return {
    username: u,
    timestamp: d(2025, 1, 1 + Math.min(27, i), 10 + (i % 10)),
    activityName: `User ${u} performed action ${i}`,
  };
});

// -------- Event (50) referencing Packages, Foods, Charges, Discounts, Employees --------
const Events = range(N).map((i) => {
  const status = statuses[(i - 1) % statuses.length];
  const clientName = `Client ${String(i).padStart(3, "0")}`;
  const clientMobile = `0918${String(3000000 + i).padStart(7, "0")}`.slice(-11);
  const rep = Employees[(i - 1) % Employees.length];
  const pkg = PackageByIdx(i);
  const pkgPrice = pkg.packagePrice;

  const food = FoodByIdx(i);
  const foodQty = 2 + (i % 5);
  const foodCost = food.price * foodQty;

  const chg = Charges[(i - 1) % Charges.length];
  const chargeQty = 1 + (i % 3);
  const chargesTotal = chg.price * chargeQty;

  const disc = Discounts[(i - 1) % Discounts.length];
  const gross = pkgPrice + foodCost + chargesTotal;
  const discountAmount = Number((gross * disc.rate).toFixed(2));
  const totalAll = Number((gross - discountAmount).toFixed(2));

  const ev = {
    status,
    clientName,
    clientMobileNumber: clientMobile,
    repName: rep.name,
    repMobileNumber: rep.contactNum,
    eventType: eventTypes[i % eventTypes.length],
    eventDate: d(2025, 2, Math.min(28, i)),
    eventTime: `${String(10 + (i % 10)).padStart(2, "0")}:00`,
    numOfPax: 50 + (i % 150),
    eventVenues: [venues[i % venues.length]],
    eventPackages: [pkg._id],
    packageAdditionalPax: false,
    menuAdditional: [
      {
        foodItem: food._id,
        foodQuantity: foodQty,
        foodCost,
      },
    ],
    transactionCharges: [
      {
        chargeName: chg.name,
        chargeQuantity: chargeQty,
        chargePrice: chg.price,
      },
    ],
    transactionDiscounts: [
      {
        discountName: disc.description,
        discountPrice: discountAmount,
      },
    ],
    totalPrices: {
      packages: pkgPrice,
      food: foodCost,
      charges: chargesTotal,
      discounts: discountAmount,
      all: totalAll,
    },
  };
  if (status === "cancelled") {
    ev.cancelReason = `Client requested cancellation #${i}`;
  }
  return ev;
});

// -------- Transaction (50) referencing charge/discount names --------
const Transactions = range(N).map((i) => {
  const chg = Charges[(i - 1) % Charges.length];
  const disc = Discounts[(i - 1) % Discounts.length];
  const chgAmount = chg.price * (1 + (i % 2));
  const discAmount = Number(((chgAmount * disc.rate) / 2).toFixed(2));
  const base = 2000 + i * 10;
  const total = Number((base + chgAmount - discAmount).toFixed(2));
  return {
    chargesList: [{ reason: chg.name, amount: chgAmount }],
    discountsList: [{ reason: disc.description, amount: discAmount }],
    totalCost: total,
    customerPayment: total,
  };
});

// -------- print as Mongo Extended JSON arrays --------
function out(label, data) {
  console.log(`/* ${label} (${data.length}) */`);
  console.log(JSON.stringify(data));
  console.log("\n");
}

out("Activity", Activities);
out("Charge", Charges);
out("Discount", Discounts);
out("Employee", Employees);
out("Food", Foods);
out("Package", Packages);
out("Event", Events);
out("Transaction", Transactions);

// mongoexport --db=STSWENG_Tables --collection=Activity --out=Activity.json
// mongoexport --db=STSWENG_Tables --collection=Charge --out=Charge.json
// mongoexport --db=STSWENG_Tables --collection=Discount --out=Discount.json
// mongoexport --db=STSWENG_Tables --collection=Employee --out=Employee.json
// mongoexport --db=STSWENG_Tables --collection=Event --out=Event.json
// mongoexport --db=STSWENG_Tables --collection=Food --out=Food.json
// mongoexport --db=STSWENG_Tables --collection=Package --out=Package.json
// mongoexport --db=STSWENG_Tables --collection=Transaction --out=Transaction.json
