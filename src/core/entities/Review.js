/**
 * Review entity
 * @typedef {object} Review
 * @property {string} id - The unique identifier of the review
 * @property {string} userId - The ID of the user who wrote the review
 * @property {string} commentary - The review commentary text
 * @property {number} score - The review score (1-5)
 * @property {Date} createdAt - When the review was created
 * @property {Date} updatedAt - When the review was last updated
 */

/**
 * Factory function to create a validated and immutable Review object.
 * @param {object} data - Raw data for the review
 * @param {string} [data.id] - The review's ID (optional, will be generated if not provided)
 * @param {string} data.userId - The user ID who wrote the review
 * @param {string} data.commentary - The review commentary text
 * @param {number} data.score - The review score (1-5)
 * @returns {Review} A new, frozen review object
 * @throws {Error} If required fields (userId, commentary, score) are missing or invalid
 */
export function createReview({ id, userId, commentary, score }) {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('Review must have a valid userId.');
    }

    if (!commentary || typeof commentary !== 'string' || commentary.trim() === '') {
        throw new Error('Review must have a commentary.');
    }

    if (
        score === undefined ||
        score === null ||
        typeof score !== 'number' ||
        score < 1 ||
        score > 5
    ) {
        throw new Error('Review score must be a number between 1 and 5.');
    }

    const generatedId = id || generateId();

    const reviewObject = {
        id: generatedId,
        userId: userId,
        commentary: commentary.trim(),
        score: score,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    return Object.freeze(reviewObject);
}

/**
 * Helper function to generate a unique ID
 * @returns {string} A unique ID for the review
 */
function generateId() {
    // Using a simple timestamp and random-based ID similar to MongoDB's approach
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    return `${timestamp}${randomPart}`;
}

/**
 * Function to update a Review object.
 * @param {object} currentReview - The current review object
 * @param {object} updateData - The data to update
 * @param {string} [updateData.commentary] - The updated commentary text
 * @param {number} [updateData.score] - The updated score
 * @returns {Review} A new, frozen updated review object
 */
export function updateReview(currentReview, updateData) {
    if (!currentReview) {
        throw new Error('Current review is required.');
    }

    if (!updateData) {
        return currentReview;
    }

    if (
        updateData.commentary !== undefined &&
        (typeof updateData.commentary !== 'string' || updateData.commentary.trim() === '')
    ) {
        throw new Error('Commentary must be a non-empty string.');
    }

    if (
        updateData.score !== undefined &&
        (typeof updateData.score !== 'number' || updateData.score < 1 || updateData.score > 5)
    ) {
        throw new Error('Score must be a number between 1 and 5.');
    }

    const updatedReview = {
        ...currentReview,
        ...updateData,
        updatedAt: new Date(),
    };

    if (updateData.commentary !== undefined) {
        updatedReview.commentary = updateData.commentary.trim();
    }

    return Object.freeze(updatedReview);
}
