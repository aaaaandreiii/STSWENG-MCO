const {
    checkStringInput
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