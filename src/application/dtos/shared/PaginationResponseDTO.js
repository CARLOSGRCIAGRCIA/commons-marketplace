/**
 * Represents a paginated response.
 * @class PaginationResponseDTO
 */
export class PaginationResponseDTO {
    /**
     * Creates an instance of PaginationResponseDTO.
     * @param {Array} data - The data of the current page.
     * @param {number} totalItems - The total number of items.
     * @param {number} totalPages - The total number of pages.
     * @param {number} currentPage - The current page number.
     */
    constructor(data, totalItems, totalPages, currentPage) {
        this.data = data;
        this.totalItems = totalItems;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
    }
}
