const { isValidDate, isValidName, 
        // isEmptyContactNumber, isValidEventType,
        // isValidEventTime, isValidPaxNum,
        // isValidVenue, isValidPackage,
        isValidQuantity, isValidPrice } 
        = require('../public/js/event-tracker-form.js');

// ------------------ GENERAL ------------------ //
// Test Suite #1
describe('Date', () => {
	// Unit Test #1
	it('Before minimum date', () => {
		const testVal = '2020-01-01';
        
		const resVal = isValidDate(testVal);
		
		expect(resVal[1]).toEqual('Date should be at least a month ago.');
	}); 

	// Unit Test #2
	it('After maximum date', () => {
		const testVal = '2040-01-01';
		
		const resVal  = isValidDate(testVal);
		
		expect(resVal[1]).toEqual('Date cannot be later than 2031.');
	});

	// Unit Test #3
	it('No date', () => {
		const testVal = '';

		const resVal = isValidDate(testVal);
		
		expect(resVal[1]).toEqual('Invalid date.');
	});	

	// Unit Test #4
	it('Not a date', () => {
		const testVal = '11111-01-01';
        
		const resVal = isValidDate(testVal);

		expect(resVal[1]).toEqual('Invalid date.');
	});	

	// Unit Test #5
	it('Valid date', () => {
		const testVal = '2022-02-02';
        
		const resVal = isValidDate(testVal);

		expect(resVal[1]).toEqual('');
	});		
});

// Test Suite #2
describe('Name', () => {
	// Unit Test #1
	it('No input', () => {
		const testVal = '';

		const resVal = isValidName(testVal);

		expect(resVal[1]).toEqual('Client name should be filled.');
	}); 

	// Unit Test #2
	it('Invalid name', () => {
		const testVal = 'Nathan;';

		const resVal = isValidName(testVal);

		expect(resVal[1]).toEqual('Invalid name. Use Alpha characters (A-Z, a-z, 0-9), period (.), and hyphens (-) only.');
	});

	// Unit Test #3
	it('Valid name', () => {
		const testVal = 'Nathan';

		const resVal = isValidName(testVal);

		expect(resVal[1]).toEqual('');
	});			
});

// Test Suite #3
describe('Quantity', () => {
	// Unit Test #1
	it('Zero', () => {
		const testVal = 0;

		const resVal = isValidQuantity(testVal);

		expect(resVal[1]).toEqual('Quantity cannot be zero.');
	}); 

	// Unit Test #2
	it('Negative number', () => {
		const testVal = -1;

		const resVal = isValidQuantity(testVal);

		expect(resVal[1]).toEqual('Quantity cannot be negative.');
	});	
    
    // Unit Test #4
	it('No input', () => {
		const testVal = '';

		const resVal = isValidQuantity(testVal);

		expect(resVal[1]).toEqual('Quantity cannot be zero.');
	});	

    // Unit Test #5
	it('Valid input', () => {
		const testVal = 40;

		const resVal = isValidQuantity(testVal);

		expect(resVal[1]).toEqual('');
	});	
});

// Test Suite #4
describe('Price', () => {
	// Unit Test #1
	it('Zero', () => {
		const testVal = 0;

		const resVal = isValidPrice(testVal);

		expect(resVal[1]).toEqual('Price cannot be zero.');
	}); 

	// Unit Test #2
	it('Negative number', () => {
		const testVal = -1;

		const resVal = isValidPrice(testVal);

		expect(resVal[1]).toEqual('Price cannot be negative.');
	});	

    // Unit Test #4
	it('No input', () => {
		const testVal = '';

		const resVal = isValidPrice(testVal);

		expect(resVal[1]).toEqual('Price cannot be zero.');
	});	

    // Unit Test #5
	it('Valid input', () => {
		const testVal = 40;

		const resVal = isValidPrice(testVal);

		expect(resVal[1]).toEqual('');
	});	
});