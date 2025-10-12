const {
    checkStringInput,
    formatAsDecimal,
    formatAsNumber,
    isValidQuantity,
    isValidTotalAmountPaid,
} = require('../public/js/event-tracker-form.js');

describe('check if contains blacklisted characters', () => {
    it('check for ~', () => {
        //arrange
        const input = 'cha~hing';

        //act
        const result = checkStringInput(input);

        //expect
        expect(result).toEqual(true);
    });

    it('check for ` #', () => {
        //arrange
        const input = 'cha`` #hing';

        //act
        const result = checkStringInput(input);

        //expect
        expect(result).toEqual(true);
    });

    it('check for $ \\', () => {
        //arrange
        const input = 'cha$hing\\';

        //act
        const result = checkStringInput(input);

        //expect
        expect(result).toEqual(true);
    });

    it('check for no blacklist', () => {
        //arrange
        const input = 'chaching';

        //act
        const result = checkStringInput(input);

        //expect
        expect(result).toEqual(false);
    });
});

describe('format decimal ', () => {
    it('round up', () => {
        //arrange
        const input = '19.875';

        //act
        const result = formatAsDecimal(input);

        //expect
        expect(result).toEqual('19.88');
    });

    it('format with two decimal places', () => {
        //arrange
        const input = '19';

        //act
        const result = formatAsDecimal(input);

        //expect
        expect(result).toEqual('19.00');
    });

    it('round down', () => {
        //arrange
        const input = '19.874';

        //act
        const result = formatAsDecimal(input);

        //expect
        expect(result).toEqual('19.87');
    });
});

describe('format numbers with commas', () => {
    it('format decimal', () => {
        //arrange
        const input = '19,875';

        //act
        const result = formatAsNumber(input);

        //expect
        expect(result).toEqual(19875);
    });

    it('format float', () => {
        //arrange
        const input = '19,207.1234';

        //act
        const result = formatAsNumber(input);

        //expect
        expect(result).toEqual(19207.1234);
    });

    it('no comma', () => {
        //arrange
        const input = '874';

        //act
        const result = formatAsNumber(input);

        //expect
        expect(result).toEqual(874);
    });
});

describe('validate quantity', () => {
    it('check for undefined', () => {
        //arrange
        const input = undefined;

        //act
        const result = isValidQuantity(input);

        //expect
        expect(result).toEqual([false, 'Quantity cannot be zero.', '']);
    });

    it('check for negative', () => {
        //arrange
        const input = -123;

        //act
        const result = isValidQuantity(input);

        //expect
        expect(result).toEqual([false, 'Quantity cannot be negative.', '']);
    });

    it('check for 0', () => {
        //arrange
        const input = 0;

        //act
        const result = isValidQuantity(input);

        //expect
        expect(result).toEqual([false, 'Quantity cannot be zero.', '']);
    });

    it('check for string', () => {
        //arrange
        const input = 'hello';

        //act
        const result = isValidQuantity(input);

        //expect
        expect(result).toEqual([false, 'Quantity cannot be zero.', '']);
    });

    it('check for null', () => {
        //arrange
        const input = null;

        //act
        const result = isValidQuantity(input);

        //expect
        expect(result).toEqual([false, 'Quantity cannot be zero.', '']);
    });

    it('check for NaN', () => {
        //arrange
        const input = NaN;

        //act
        const result = isValidQuantity(input);

        //expect
        expect(result).toEqual([false, 'Quantity cannot be zero.', '']);
    });

    it('valid input', () => {
        //arrange
        const input = 123;

        //act
        const result = isValidQuantity(input);

        //expect
        expect(result).toEqual([true, '', input]);
    });
});

describe('check for valid amount paid', () => {
    it('check for negative balance', () => {
        //arrange
        const downPayment = 19875;
        const finalPayment = 19875;
        const total = 19000;

        //act
        const result = isValidTotalAmountPaid(downPayment, finalPayment, total);

        //expect
        expect(result).toEqual([
            false,
            'Customer payment is greater than the total price.',
        ]);
    });

    it('check for positive balance', () => {
        //arrange
        const downPayment = 19875;
        const finalPayment = 19875;
        const total = 400000;

        //act
        const result = isValidTotalAmountPaid(downPayment, finalPayment, total);

        //expect
        expect(result).toEqual([true, 'Remaining Balance: P' + 360250]);
    });

    it('check for zero balance', () => {
        //arrange
        const downPayment = 19875;
        const finalPayment = 19875;
        const total = 39750;

        //act
        const result = isValidTotalAmountPaid(downPayment, finalPayment, total);

        //expect
        expect(result).toEqual([true, 'Event is fully paid.']);
    });
});