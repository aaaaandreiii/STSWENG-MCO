const {
  isValidDate,
  isValidName,
  isEmptyContactNumber,
  isValidEventType,
  isValidEventTime,
  isValidPaxNum,
  isValidVenue,
  isValidPackage,
  isAddFoodNameinList,
  isValidQuantity,
  isValidModeOfPayment,
  isValidPrice,
  isValidTotalAmountPaid,
  checkPaxDiscountTest,
} = require("../public/js/event-tracker-form.js");


// ------------------ GENERAL ------------------ //
// Test Suite #1
describe("Date", () => {
  // Unit Test #1
  it("Before minimum date", () => {
    const testVal = "2020-01-01";

    const resVal = isValidDate(testVal);

    expect(resVal[1]).toEqual("Date should be at least a month ago.");
  });

	// Unit Test #2
	it('After maximum date', () => {
		const testVal = '2040-01-01';
		
		const resVal  = isValidDate(testVal);
		
		expect(resVal[1]).toEqual('Date cannot be later than 2031.');
	});

  // Unit Test #3
  it("No date", () => {
    const testVal = "";

    const resVal = isValidDate(testVal);

    expect(resVal[1]).toEqual("Invalid date.");
  });

  // Unit Test #4
  it("Not a date", () => {
    const testVal = "11111-01-01";

    const resVal = isValidDate(testVal);

    expect(resVal[1]).toEqual("Invalid date.");
  });

  // Unit Test #5
  it("Valid date", () => {
    const testVal = "2025-11-06";

    const resVal = isValidDate(testVal);

    expect(resVal[1]).toEqual("");
  });
});

// Test Suite #2
describe("Name", () => {
  // Unit Test #1
  it("No input", () => {
    const testVal = "";

    const resVal = isValidName(testVal);

    expect(resVal[1]).toEqual("Client name should be filled.");
  });

  // Unit Test #2
  it("Invalid name", () => {
    const testVal = "Nathan;";

    const resVal = isValidName(testVal);

    expect(resVal[1]).toEqual(
      "Invalid name. Use Alpha characters (A-Z, a-z, 0-9), period (.), and hyphens (-) only.",
    );
  });

  // Unit Test #3
  it("Valid name", () => {
    const testVal = "Nathan";

    const resVal = isValidName(testVal);

    expect(resVal[1]).toEqual("");
  });
});

// Test Suite #3
describe("Quantity", () => {
  // Unit Test #1
  it("Zero", () => {
    const testVal = 0;

    const resVal = isValidQuantity(testVal);

    expect(resVal[1]).toEqual("Quantity cannot be zero.");
  });

  // Unit Test #2
  it("Negative number", () => {
    const testVal = -1;

    const resVal = isValidQuantity(testVal);

    expect(resVal[1]).toEqual("Quantity cannot be negative.");
  });

  // Unit Test #4
  it("No input", () => {
    const testVal = "";

    const resVal = isValidQuantity(testVal);

    expect(resVal[1]).toEqual("Quantity cannot be zero.");
  });

  // Unit Test #5
  it("Valid input", () => {
    const testVal = 40;

    const resVal = isValidQuantity(testVal);

    expect(resVal[1]).toEqual("");
  });
});

// Test Suite #4
describe("Price", () => {
  // Unit Test #1
  it("Zero", () => {
    const testVal = 0;

    const resVal = isValidPrice(testVal);

    expect(resVal[1]).toEqual("Price cannot be zero.");
  });

  // Unit Test #2
  it("Negative number", () => {
    const testVal = -1;

    const resVal = isValidPrice(testVal);

    expect(resVal[1]).toEqual("Price cannot be negative.");
  });

  // Unit Test #4
  it("No input", () => {
    const testVal = "";

    const resVal = isValidPrice(testVal);

    expect(resVal[1]).toEqual("Price cannot be zero.");
  });

  // Unit Test #5
  it("Valid input", () => {
    const testVal = 40;

    const resVal = isValidPrice(testVal);

    expect(resVal[1]).toEqual("");
  });
});

// ------------------ EVENT DETAILS ------------------ //
// Test Suite #5
describe("Contact Number", () => {
  // Unit Test #1
  it("No input", () => {
    const testVal = "";

    const resVal = isEmptyContactNumber(testVal);

    expect(resVal[1]).toEqual("Mobile Number should be filled.");
  });

  // Unit Test #2
  it("Has invalid number input", () => {
    const testVal = "999999";

    const resVal = isEmptyContactNumber(testVal);

    expect(resVal[1]).toEqual("");
  });

  // Unit Test #3
  it("Has valid number input", () => {
    const testVal = "09183774544";

    const resVal = isEmptyContactNumber(testVal);

    expect(resVal[1]).toEqual("");
  });
});

// Test Suite #6
describe("Event Type", () => {
  // Unit Test #1
  it("No input", () => {
    const testVal = "";

    const resVal = isValidEventType(testVal);

    expect(resVal[1]).toEqual("Event type should be filled.");
  });

  // Unit Test #2
  it("Valid event type", () => {
    const testVal = "Birthday";

    const resVal = isValidEventType(testVal);

    expect(resVal[1]).toEqual("");
  });
});

// Test Suite #7
describe("Event Time", () => {
  // Unit Test #1
  it("Selected none", () => {
    const testVal = "";

    const resVal = isValidEventTime(testVal);

    expect(resVal[1]).toEqual("Event time cannot be empty.");
  });

  // Unit Test #2
  it("Selected event time is afternoon", () => {
    const testVal = "Afternoon (11:00 AM - 2:00 PM)";

    const resVal = isValidEventTime(testVal);

    expect(resVal[1]).toEqual(testVal);
  });

  // Unit Test #3
  it("Selected event time is evening", () => {
    const testVal = "Evening (4:00 PM - 7:00 PM)";

    const resVal = isValidEventTime(testVal);

    expect(resVal[1]).toEqual(testVal);
  });
});

// Test Suite #8
describe("Number of Pax", () => {
  // Unit Test #1
  it("Zero", () => {
    const testVal = 0;

    const resVal = isValidPaxNum(testVal);

    expect(resVal[1]).toEqual("Number of pax cannot be zero.");
  });

  // Unit Test #2
  it("Negative number", () => {
    const testVal = -1;

    const resVal = isValidPaxNum(testVal);

    expect(resVal[1]).toEqual("Number of pax cannot be negative.");
  });

  // Unit Test #3
  it("Greater than the maximum (120)", () => {
    const testVal = 121;

    const resVal = isValidPaxNum(testVal);

    expect(resVal[1]).toEqual("Number of pax cannot be more than 120.");
  });

  // Unit Test #4
  it("No input", () => {
    const testVal = "";

    const resVal = isValidPaxNum(testVal);

    expect(resVal[1]).toEqual("Number of pax cannot be zero.");
  });

  // Unit Test #5
  it("Valid input", () => {
    const testVal = 40;

    const resVal = isValidPaxNum(testVal);

    expect(resVal[1]).toEqual("");
  });
});

// Test Suite #9
describe("Event Venue", () => {
  // Unit Test #1
  it("Selected none", () => {
    const gTestVal = "";
    const sTestVal = "";
    const tTestVal = "";

    const resVal = isValidVenue(gTestVal, sTestVal, tTestVal);

    expect(resVal[1]).toEqual("At least 1 venue should be checked.");
  });

  // Unit Test #2
  it("Selected Garden", () => {
    const gTestVal = "Garden";
    const sTestVal = "";
    const tTestVal = "";

    const resVal = isValidVenue(gTestVal, sTestVal, tTestVal);

    expect(resVal[1]).toEqual("Garden");
  });

  // Unit Test #3
  it("Selected Sunroom", () => {
    const gTestVal = "";
    const sTestVal = "Sunroom";
    const tTestVal = "";

    const resVal = isValidVenue(gTestVal, sTestVal, tTestVal);

    expect(resVal[1]).toEqual("Sunroom");
  });

  // Unit Test #4
  it("Selected Terrace", () => {
    const gTestVal = "";
    const sTestVal = "";
    const tTestVal = "Terrace";

    const resVal = isValidVenue(gTestVal, sTestVal, tTestVal);

    expect(resVal[1]).toEqual("Terrace");
  });

  // Unit Test #5
  it("Selected Garden and Sunroom", () => {
    const gTestVal = "Garden";
    const sTestVal = "Sunroom";
    const tTestVal = "";

    const resVal = isValidVenue(gTestVal, sTestVal, tTestVal);

    expect(resVal[1]).toEqual("GardenSunroom");
  });

  // Unit Test #6
  it("Selected Garden and Terrace", () => {
    const gTestVal = "Garden";
    const sTestVal = "";
    const tTestVal = "Terrace";

    const resVal = isValidVenue(gTestVal, sTestVal, tTestVal);

    expect(resVal[1]).toEqual("GardenTerrace");
  });

  // Unit Test #5
  it("Selected Sunroom and Terrace", () => {
    const gTestVal = "Garden";
    const sTestVal = "Sunroom";
    const tTestVal = "";

    const resVal = isValidVenue(gTestVal, sTestVal, tTestVal);

    expect(resVal[1]).toEqual("GardenSunroom");
  });

  // Unit Test #6
  it("Selected Garden, Sunroom, and Terrace", () => {
    const gTestVal = "Garden";
    const sTestVal = "Sunroom";
    const tTestVal = "Terrace";

    const resVal = isValidVenue(gTestVal, sTestVal, tTestVal);

    expect(resVal[1]).toEqual("GardenSunroomTerrace");
  });
});

// Test Suite #10
describe("Event Package", () => {
  // Unit Test #1
  it("Selected none", () => {
    const gTestVal = "";
    const sTestVal = "";
    const tTestVal = "";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1]).toEqual("At least 1 Package should be selected.");
  });

  // Unit Test #2
  it("Selected a Garden Package ", () => {
    const gTestVal = "gar10-4var-cov";
    const sTestVal = "";
    const tTestVal = "";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1].trim()).toEqual("gar10-4var-cov");
  });

  // Unit Test #3
  it("Selected a Sunroom Package ", () => {
    const gTestVal = "";
    const sTestVal = "sun20";
    const tTestVal = "";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1].trim()).toEqual("sun20");
  });

  // Unit Test #4
  it("Selected a Terrace Package ", () => {
    const gTestVal = "";
    const sTestVal = "";
    const tTestVal = "ter15";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1].trim()).toEqual("ter15");
  });

  // Unit Test #5
  it("Selected Garden and Sunroom as venue but only selected a Sunroom Package", () => {
    const gTestVal = "";
    const sTestVal = "sun20";
    const tTestVal = "";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1].trim()).toEqual("sun20");
  });

  // Unit Test #6
  it("Selected Sunroom and Terrace as venue but only selected a Terrace Package", () => {
    const gTestVal = "";
    const sTestVal = "";
    const tTestVal = "ter15";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1].trim()).toEqual("ter15");
  });

  // Unit Test #7
  it("Selected Garden and Terrace as venue but only selected a Garden Package", () => {
    const gTestVal = "gar15-6var-cov";
    const sTestVal = "";
    const tTestVal = "";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1].trim()).toEqual("gar15-6var-cov");
  });

  // Unit Test #8
  it("Selected Garden and Terrace Packages", () => {
    const gTestVal = "gar70";
    const sTestVal = "";
    const tTestVal = "ter15";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1].trim()).toEqual("gar70  ter15");
  });

  // Unit Test #9
  it("Selected Sunroom and Terrace Packages", () => {
    const gTestVal = "";
    const sTestVal = "sun20";
    const tTestVal = "ter15";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1].trim()).toEqual("sun20 ter15");
  });

  // Unit Test #10
  it("Selected Garden and Terrace Packages", () => {
    const gTestVal = "gar50";
    const sTestVal = "sun20";
    const tTestVal = "";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1].trim()).toEqual("gar50 sun20");
  });

  // Unit Test #11
  it("Selected Garden, Sunroom, and Terrace Packages", () => {
    const gTestVal = "gar30";
    const sTestVal = "sun20";
    const tTestVal = "ter15";

    const resVal = isValidPackage(gTestVal, sTestVal, tTestVal);

    expect(resVal[1].trim()).toEqual("gar30 sun20 ter15");
  });
});

//Test Suite #11
describe("Adding Pax Discount", () => {
  // Unit Test #1
  it("Valid input (49) did not meet the least pax (50) for the discount.", () => {
    const testVal = 49;

    const resVal = checkPaxDiscountTest(testVal);

    expect(resVal).toEqual("No discount");
  });

  // Unit Test #2
  it("Valid input (50) is included and the least pax in the pax discount list", () => {
    const testVal = 50;

    const resVal = checkPaxDiscountTest(testVal);

    expect(resVal).toEqual({
      description: "10%PAXDISCOUNT50",
      rate: 10,
      minimumPax: 50,
    });
  });

  // Unit Test #3
  it("Valid input (60) is not in the pax discount list but greater than the least pax (50) in the list", () => {
    const testVal = 60;

    const resVal = checkPaxDiscountTest(testVal);

    expect(resVal).toEqual({
      description: "10%PAXDISCOUNT50",
      rate: 10,
      minimumPax: 50,
    });
  });

  // Unit Test #4
  it("Valid input (119) is not in the pax discount list but greater than one of the pax (100) in the list", () => {
    const testVal = 119;

    const resVal = checkPaxDiscountTest(testVal);

    expect(resVal).toEqual({
      description: "20%PAXDISCOUNT100",
      rate: 20,
      minimumPax: 100,
    });
  });

  // Unit Test #5
  it("Valid input (120) is included and the highest pax in the pax discount list", () => {
    const testVal = 120;

    const resVal = checkPaxDiscountTest(testVal);

    expect(resVal).toEqual({
      description: "30%PAXDISCOUNT120",
      rate: 30,
      minimumPax: 120,
    });
  });

  // Unit Test #6
  it("Invalid input (zero) - no discount", () => {
    const testVal = 0;

    const resVal = checkPaxDiscountTest(testVal);

    expect(resVal).toEqual("Number of pax cannot be zero.");
  });

  // Unit Test #7
  it("Invalid input (negative number) - no discount", () => {
    const testVal = -1;

    const resVal = checkPaxDiscountTest(testVal);

    expect(resVal).toEqual("Number of pax cannot be negative.");
  });

  // Unit Test #8
  it("Invalid input (exceeded maximum pax: >120)- no discount", () => {
    const testVal = 121;

    const resVal = checkPaxDiscountTest(testVal);

    expect(resVal).toEqual("Number of pax cannot be more than 120.");
  });

  // Unit Test #9
  it("Invalid input (empty) - no discount", () => {
    const testVal = "";

    const resVal = checkPaxDiscountTest(testVal);

    expect(resVal).toEqual("Number of pax cannot be zero.");
  });
});

// ------------------ MENU DETAILS ------------------ //
// Test Suite #12
describe("Additional Food Name", () => {
  // Unit Test #1
  it("No input", () => {
    const testVal = "";

    const resVal = isAddFoodNameinList(testVal);
    expect(resVal[1]).toEqual("");
    expect(resVal[2]).toEqual("Empty input.");
  });

  // Unit Test #2
  it("Food Name not in the list", () => {
    const testVal = "Bacon";

    const resVal = isAddFoodNameinList(testVal);

    expect(resVal[1]).toEqual("");
    expect(resVal[2]).toEqual("Bacon is not in the list.");
  });

  // Unit Test #3
  it("Food Name is in the list", () => {
    const testVal = "Balai Yllana Garden Salad";

    const resVal = isAddFoodNameinList(testVal);

    expect(resVal[1]).toEqual(235);
    expect(resVal[2]).toEqual("Balai Yllana Garden Salad is in the list.");
  });
});

// ------------------ PAYMENT DETAILS ------------------ //
// Test Suite #13
describe("Mode of Payment", () => {
  // Unit Test #1
  it("Selected none", () => {
    const testVal = "";

    const resVal = isValidModeOfPayment(testVal);

    expect(resVal[1]).toEqual("Select 1 payment mode.");
  });

  // Unit Test #2
  it("Selected Cash as mode of payment", () => {
    const testVal = "Cash";

    const resVal = isValidModeOfPayment(testVal);

    expect(resVal[1]).toEqual("Cash");
  });

  // Unit Test #3
  it("Selected Credit Card as mode of payment", () => {
    const testVal = "Credit Card";

    const resVal = isValidModeOfPayment(testVal);

    expect(resVal[1]).toEqual("Credit Card");
  });

  // Unit Test #4
  it("Selected GCash as mode of payment", () => {
    const testVal = "GCash";

    const resVal = isValidModeOfPayment(testVal);

    expect(resVal[1]).toEqual("GCash");
  });

  // Unit Test #5
  it("Selected Bank Transfer as mode of payment", () => {
    const testVal = "Bank Transfer";

    const resVal = isValidModeOfPayment(testVal);

    expect(resVal[1]).toEqual("Bank Transfer");
  });
});

// Test Suite #14
describe("Total Amount Paid", () => {
  // Unit Test #1
  it("No payment yet.", () => {
    const testDPay = 0;
    const testFPay = 0;
    const testTPay = 25000;

    const resVal = isValidTotalAmountPaid(testDPay, testFPay, testTPay);

    expect(resVal[1]).toEqual("Remaining Balance: P25000");
  });

  // Unit Test #2
  it("Downpayment", () => {
    const testDPay = 13550;
    const testFPay = 0;
    const testTPay = 25000;

    const resVal = isValidTotalAmountPaid(testDPay, testFPay, testTPay);

    expect(resVal[1]).toEqual("Remaining Balance: P11450");
  });

  // Unit Test #3
  it("Final payment that exceeded the total balance", () => {
    const testDPay = 14000;
    const testFPay = 16500;
    const testTPay = 30000;

    const resVal = isValidTotalAmountPaid(testDPay, testFPay, testTPay);

    expect(resVal[1]).toEqual(
      "Customer payment is greater than the total price.",
    );
  });

  // Unit Test #4
  it("Customer has paid both downpayment and final payment", () => {
    const testDPay = 14000;
    const testFPay = 6000;
    const testTPay = 20000;

    const resVal = isValidTotalAmountPaid(testDPay, testFPay, testTPay);

    expect(resVal[1]).toEqual("Event is fully paid.");
  });
});