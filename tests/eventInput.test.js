const {
    checkStringInput,
    formatAsDecimal,
    formatAsNumber
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