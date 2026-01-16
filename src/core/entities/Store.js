/**
 * Describes the structure of a Store entity.
 * @typedef {object} Store
 * @property {string} id - The unique identifier of the store.
 * @property {string} userId - The ID of the user who owns this store.
 * @property {string} storeName - The public name of the store.
 * @property {string} description - A description of the store.
 * @property {string} logo - The URL of the store's logo image.
 * @property {string} status - The current status ('Pending', 'Approved', 'Rejected').
 */

/**
 * Factory function to create a validated and immutable Store object.
 * @param {object} data - Raw data for the store.
 * @param {string} [data.id] - The store's ID.
 * @param {string} data.userId - The owner's user ID.
 * @param {string} data.storeName - The name of the store.
 * @param {string} [data.description] - An optional description for the store.
 * @param {string} [data.logo] - The URL of the store's logo.
 * @param {string} [data.status] - The initial status of the store.
 * @returns {Store} A new, frozen store object.
 * @throws {Error} If required fields (userId, storeName) are missing.
 */
export function createStore({ id, userId, storeName, description, logo, status }) {
    if (!userId || !storeName) {
        throw new Error('Store must have a userId and a storeName.');
    }

    const storeObject = {
        id: id ?? null,
        userId: userId,
        storeName: storeName,
        description: description ?? '',
        logo:
            logo ??
            'https://imgs.search.brave.com/r86IVLpFpqUE3EBJn9EwpQjLFbU7nzFWrM5twOAPfi4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjgv/MDcxLzI1MS9zbWFs/bC9vbmxpbmUtc2hv/cC1sb2dvLWRlc2ln/bnMtdGVtcGxhdGUt/aWxsdXN0cmF0aW9u/LWdyYXBoaWMtb2Yt/cG9pbnRlci1hcnJv/dy1hbmQtc2hvcC1i/YWctY29tYmluYXRp/b24tbG9nby1kZXNp/Z24tY29uY2VwdC1w/ZXJmZWN0LWZvci1l/Y29tbWVyY2Utc2Fs/ZS1kaXNjb3VudC1v/ci1zdG9yZS13ZWIt/ZWxlbWVudC1jb21w/YW55LWVtYmxlbS12/ZWN0b3IuanBn',
        status: status ?? 'Pending',
    };
    return Object.freeze(storeObject);
}
