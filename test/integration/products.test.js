import request from 'supertest';

describe('Products Integration', () => {
    describe('GET /api/products', () => {
        it('should return products list', async () => {
            const response = await request('http://localhost:3000')
                .get('/api/products')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should support pagination', async () => {
            const response = await request('http://localhost:3000')
                .get('/api/products?page=1&limit=10')
                .expect(200);
            expect(response.body).toHaveProperty('data');
        });

        it('should filter by category', async () => {
            const response = await request('http://localhost:3000')
                .get('/api/products?category=electronics')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter by price range', async () => {
            const response = await request('http://localhost:3000')
                .get('/api/products?minPrice=10&maxPrice=100')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return 404 for non-existent product', async () => {
            await request('http://localhost:3000').get('/api/products/nonexistent-id').expect(404);
        });
    });

    describe('POST /api/products (protected)', () => {
        it('should require authentication', async () => {
            await request('http://localhost:3000')
                .post('/api/products')
                .send({ name: 'Test', price: 100 })
                .expect(401);
        });
    });

    describe('PUT /api/products/:id (protected)', () => {
        it('should require authentication', async () => {
            await request('http://localhost:3000')
                .put('/api/products/test-id')
                .send({ name: 'Updated' })
                .expect(401);
        });
    });

    describe('DELETE /api/products/:id (protected)', () => {
        it('should require authentication', async () => {
            await request('http://localhost:3000').delete('/api/products/test-id').expect(401);
        });
    });
});

describe('Categories Integration', () => {
    describe('GET /api/categories', () => {
        it('should return categories list', async () => {
            const response = await request('http://localhost:3000')
                .get('/api/categories')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /api/categories/main', () => {
        it('should return main categories', async () => {
            const response = await request('http://localhost:3000')
                .get('/api/categories/main')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});
