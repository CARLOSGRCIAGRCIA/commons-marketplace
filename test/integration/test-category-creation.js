import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Category Creation Test for CommonMarketplace Service
 * Testing category creation with the authenticated token
 */

const BASE_URL = process.env.TEST_BASE_URL; // Update with your actual server URL

// Create axios instance with explicit HTTPS agent
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

/**
 * Performs the complete category creation test flow
 * @returns {Promise<object>} Promise that resolves to test result object
 */
async function getCategoryCreationTest() {
    // First, log in to get a valid token
    const ADMIN_EMAIL = '<EMAIL_ADDRESS>';
    const ADMIN_PASSWORD = '<PASSWORD>';

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

        // Generate unique name for the test category
        const categoryName = `Test Category ${Date.now()}`;
        const categoryDescription = 'This is a test category created during integration testing';

        // Create the category with authentication
        const categoryResponse = await axios.post(
            `${BASE_URL}/api/categories`,
            {
                name: categoryName,
                description: categoryDescription,
                slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
            },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                httpsAgent,
                timeout: 20000,
            },
        );

        const createdCategory = categoryResponse.data;

        // Step 3: Verify the created category
        await axios.get(`${BASE_URL}/api/categories/${createdCategory.id}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            httpsAgent,
            timeout: 10000,
        });

        // Step 4: Check if category appears in the main categories list
        const allCategoriesResponse = await axios.get(`${BASE_URL}/api/categories`, {
            httpsAgent,
            timeout: 10000,
        });

        const allCategories = Array.isArray(allCategoriesResponse.data)
            ? allCategoriesResponse.data
            : allCategoriesResponse.data.data || [];
        const foundCategory = allCategories.find((cat) => cat.id === createdCategory.id);

        // Verify that the created category exists in the categories list
        if (!foundCategory) {
            throw new Error(
                `Created category with id ${createdCategory.id} was not found in the categories list`,
            );
        }

        return {
            success: true,
            token: authToken,
            categoryId: createdCategory.id,
            categoryName: createdCategory.name,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            errorDetails: error.response ? error.response.data : error.message,
        };
    }
}

// Run the category creation test
getCategoryCreationTest();
