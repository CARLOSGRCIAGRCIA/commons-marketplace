/**
 * DTO for updating seller request status
 * @param {object} data - Update data
 * @returns {object} Formatted DTO
 */
export const updateSellerRequestStatusDTO = (data) => ({
    status: data.status,
    adminComment: data.adminComment || '',
});
