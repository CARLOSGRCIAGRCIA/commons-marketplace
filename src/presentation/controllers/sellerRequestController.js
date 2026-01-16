import {
    sellerRequestResponseDTO,
    sellerRequestListResponseDTO,
} from '../../application/dtos/sellerRequests/index.js';

/**
 * Creates seller request controller with dependency injection
 * @param {object} useCases - Seller request use cases
 * @returns {object} Controller functions
 */
export const createSellerRequestController = (useCases) => {
    /**
     * Creates a new seller request
     * @param {object} req - Express request
     * @param {object} res - Express response
     * @param {Function} next - Express next function
     * @returns {Promise<void>}
     */
    const createSellerRequest = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const requestData = req.body;

            const newRequest = await useCases.createSellerRequest(userId, requestData);

            res.status(201).json(sellerRequestResponseDTO(newRequest));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Gets all seller requests
     * @param {object} req - Express request
     * @param {object} res - Express response
     * @param {Function} next - Express next function
     * @returns {Promise<void>}
     */
    const getAllSellerRequests = async (req, res, next) => {
        try {
            const filter = {};

            if (req.query.status) {
                filter.status = req.query.status;
            }

            const options = {
                sort: { createdAt: -1 },
            };

            const requests = await useCases.getAllSellerRequests(filter, options);

            res.status(200).json(sellerRequestListResponseDTO(requests));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Gets a seller request by ID
     * @param {object} req - Express request
     * @param {object} res - Express response
     * @param {Function} next - Express next function
     * @returns {Promise<void>}
     */
    const getSellerRequestById = async (req, res, next) => {
        try {
            const requestId = req.params.id;

            const request = await useCases.getSellerRequestById(requestId);

            res.status(200).json(sellerRequestResponseDTO(request));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Gets seller request for authenticated user
     * @param {object} req - Express request
     * @param {object} res - Express response
     * @param {Function} next - Express next function
     * @returns {Promise<void>}
     */
    const getUserSellerRequest = async (req, res, next) => {
        try {
            const userId = req.user.id;

            const request = await useCases.getSellerRequestByUserId(userId);

            if (request.status === 'not_found') {
                return res.status(200).json(request);
            }

            res.status(200).json(sellerRequestResponseDTO(request));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Updates seller request status (admin only)
     * @param {object} req - Express request
     * @param {object} res - Express response
     * @param {Function} next - Express next function
     * @returns {Promise<void>}
     */
    const updateSellerRequestStatus = async (req, res, next) => {
        try {
            const requestId = req.params.id;
            const updateData = req.body;

            const updatedRequest = await useCases.updateSellerRequestStatus(requestId, updateData);

            res.status(200).json(sellerRequestResponseDTO(updatedRequest));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Deletes a seller request (admin only)
     * @param {object} req - Express request
     * @param {object} res - Express response
     * @param {Function} next - Express next function
     * @returns {Promise<void>}
     */
    const deleteSellerRequest = async (req, res, next) => {
        try {
            const requestId = req.params.id;

            const deletedRequest = await useCases.deleteSellerRequest(requestId);

            res.status(200).json({
                message: 'Seller request deleted successfully',
                data: sellerRequestResponseDTO(deletedRequest),
            });
        } catch (error) {
            next(error);
        }
    };

    return {
        createSellerRequest,
        getAllSellerRequests,
        getSellerRequestById,
        getUserSellerRequest,
        updateSellerRequestStatus,
        deleteSellerRequest,
    };
};
