/**
 * @typedef {object} UpdateStoreStatusDTO
 * @property {string} status - The new status for the store.
 * @property {string} [reason] - An optional reason for status change (e.g., rejection reason).
 */

/**
 * Factory function to create an UpdateStoreStatusDTO object.
 * @param {object} data - Raw data for updating store status.
 * @param {string} data.status - The new status for the store.
 * @param {string} [data.reason] - An optional reason for status change.
 * @returns {UpdateStoreStatusDTO} The created and frozen DTO object.
 * @throws {Error} If status is missing or invalid.
 */
export function createUpdateStoreStatusDTO({ status, reason }) {
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Suspended'];

    if (!status || !validStatuses.includes(status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const dto = {
        status: status,
        reason: reason || null,
    };

    return Object.freeze(dto);
}
