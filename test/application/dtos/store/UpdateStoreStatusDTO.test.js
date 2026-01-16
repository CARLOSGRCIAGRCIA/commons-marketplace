import { createUpdateStoreStatusDTO } from '../../../../src/application/dtos/stores/UpdateStoreStatusDTO.js';

describe('UpdateStoreStatusDTO Tests', () => {
    it('should create a valid UpdateStoreStatusDTO with status only', () => {
        const data = {
            status: 'Approved',
        };

        const dto = createUpdateStoreStatusDTO(data);

        expect(dto).toEqual({
            status: 'Approved',
            reason: null,
        });
        expect(Object.isFrozen(dto)).toBe(true);
    });

    it('should create a valid UpdateStoreStatusDTO with status and reason', () => {
        const data = {
            status: 'Rejected',
            reason: 'Store description does not meet guidelines',
        };

        const dto = createUpdateStoreStatusDTO(data);

        expect(dto).toEqual({
            status: 'Rejected',
            reason: 'Store description does not meet guidelines',
        });
        expect(Object.isFrozen(dto)).toBe(true);
    });

    it('should handle all valid statuses', () => {
        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Suspended'];

        validStatuses.forEach((status) => {
            const data = { status };
            const dto = createUpdateStoreStatusDTO(data);

            expect(dto.status).toBe(status);
            expect(dto.reason).toBe(null);
        });
    });

    it('should set default null for reason when not provided', () => {
        const data = {
            status: 'Approved',
        };

        const dto = createUpdateStoreStatusDTO(data);

        expect(dto.reason).toBe(null);
    });

    it('should set default null for reason when undefined', () => {
        const data = {
            status: 'Approved',
            reason: undefined,
        };

        const dto = createUpdateStoreStatusDTO(data);

        expect(dto.reason).toBe(null);
    });

    it('should handle null reason', () => {
        const data = {
            status: 'Approved',
            reason: null,
        };

        const dto = createUpdateStoreStatusDTO(data);

        expect(dto.reason).toBe(null);
    });

    it('should handle empty string reason (should convert to null based on implementation)', () => {
        const data = {
            status: 'Rejected',
            reason: '',
        };

        const dto = createUpdateStoreStatusDTO(data);

        expect(dto.reason).toBe(null);
    });

    it('should throw error when status is missing', () => {
        const data = {
            reason: 'Some reason',
        };

        expect(() => createUpdateStoreStatusDTO(data)).toThrow(
            'Status must be one of: Pending, Approved, Rejected, Suspended',
        );
    });

    it('should throw error when status is empty string', () => {
        const data = {
            status: '',
        };

        expect(() => createUpdateStoreStatusDTO(data)).toThrow(
            'Status must be one of: Pending, Approved, Rejected, Suspended',
        );
    });

    it('should throw error when status is null', () => {
        const data = {
            status: null,
        };

        expect(() => createUpdateStoreStatusDTO(data)).toThrow(
            'Status must be one of: Pending, Approved, Rejected, Suspended',
        );
    });

    it('should throw error when status is undefined', () => {
        const data = {
            status: undefined,
        };

        expect(() => createUpdateStoreStatusDTO(data)).toThrow(
            'Status must be one of: Pending, Approved, Rejected, Suspended',
        );
    });

    it('should throw error when status is invalid', () => {
        const data = {
            status: 'InvalidStatus',
        };

        expect(() => createUpdateStoreStatusDTO(data)).toThrow(
            'Status must be one of: Pending, Approved, Rejected, Suspended',
        );
    });
});
