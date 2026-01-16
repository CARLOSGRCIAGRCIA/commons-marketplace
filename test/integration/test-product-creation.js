import axios from 'axios';
import FormData from 'form-data';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Product Creation Test for CommonMarketplace Service
 * Testing product creation with the authenticated token
 */

const BASE_URL = process.env.TEST_BASE_URL; // Using centralized URL from .env

// Create axios instance with explicit HTTPS agent
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

/**
 * Creates a minimal test image in PNG format
 * @returns {object} Object containing image buffer, filename, and mimetype
 */
const createTestImage = () => {
    // Small 1x1 pixel PNG image data (base64 encoded)
    const base64ImageData =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(base64ImageData, 'base64');

    return {
        buffer: imageBuffer,
        filename: 'test-image.png',
        mimetype: 'image/png',
    };
};

/**
 * Performs the complete product creation test flow
 * @returns {Promise<object>} Promise that resolves to test result object
 */
async function getProductCreationTest() {
    // First, log in to get a valid token
    const ADMIN_EMAIL = '<your_admin_email_here>';
    const ADMIN_PASSWORD = '<your_seller_password_here>';

    try {
        const loginResponse = await axios.post(
            `${BASE_URL}/api/auth/login`,
            {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
            },
            {
                httpsAgent,
                timeout: 10000,
            },
        );

        const authToken = loginResponse.data.token.access_token || loginResponse.data.token;

        // Use provided hardcoded values for product creation
        const productName = 'Iphone 15';
        const productDescription = 'Latest Apple smartphone with advanced features';
        const productPrice = '1199.99';
        const productStock = '15';
        const hardcodedCategoryId = '692105decc44b6af9928d4d1'; // Provided category ID
        const hardcodedSubCategoryId = '69210656cc44b6af9928d4d6'; // Provided subcategory ID
        const hardcodedStoreId = '692bb90da7a29012e2f3c6d4'; // Provided store ID

        // Check if we have all required IDs
        if (!hardcodedStoreId || !hardcodedCategoryId) {
            return { success: false, error: 'Missing store or category ID' };
        }

        // Create form data for product creation
        const formData = new FormData();
        formData.append('name', productName);
        formData.append('description', productDescription);
        formData.append('price', productPrice);
        formData.append('stock', productStock);
        formData.append('categoryId', hardcodedCategoryId);
        formData.append('subCategoryId', hardcodedSubCategoryId); // Adding subcategory if available
        formData.append('storeId', hardcodedStoreId);

        // Create and append test image
        const testImage = createTestImage();
        formData.append('mainImage', testImage.buffer, {
            filename: 'image.png', // Use the specified filename
            contentType: testImage.mimetype,
        });

        // Create the axios config for multipart/form-data
        const productResponse = await axios.post(`${BASE_URL}/api/products`, formData, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                ...formData.getHeaders(), // This includes content-type with boundary
            },
            httpsAgent,
            timeout: 20000,
        });

        const createdProduct = productResponse.data;

        // Verify the created product
        const verifyResponse = await axios.get(`${BASE_URL}/api/products/${createdProduct.id}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            httpsAgent,
            timeout: 10000,
        });

        const verifiedProduct = verifyResponse.data;

        // Verify that the product exists and has the expected properties
        if (!verifiedProduct || verifiedProduct.id !== createdProduct.id) {
            throw new Error(
                `Created product with id ${createdProduct.id} was not found or doesn't match during verification`,
            );
        }

        return {
            success: true,
            token: authToken,
            productId: createdProduct.id,
            storeId: hardcodedStoreId,
            categoryId: hardcodedCategoryId,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            errorDetails: error.response ? error.response.data : error.message,
        };
    }
}

// Run the product creation test
getProductCreationTest();
