import {
    createUserValidation,
    updateUserValidation,
    userIdParamValidation,
} from '../../../src/presentation/validators/userValidator.js';

describe('User Validators', () => {
    describe('createUserValidation', () => {
        it('should return an array of validation rules', () => {
            const rules = createUserValidation();
            expect(Array.isArray(rules)).toBe(true);
            expect(rules.length).toBeGreaterThan(0);
        });
    });

    describe('updateUserValidation', () => {
        it('should return an array of validation rules', () => {
            const rules = updateUserValidation();
            expect(Array.isArray(rules)).toBe(true);
            expect(rules.length).toBeGreaterThan(0);
        });
    });

    describe('userIdParamValidation', () => {
        it('should return an array of validation rules', () => {
            const rules = userIdParamValidation();
            expect(Array.isArray(rules)).toBe(true);
            expect(rules.length).toBeGreaterThan(0);
        });
    });
});
