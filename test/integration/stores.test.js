import request from 'supertest';

describe('Stores Integration', () => {
    describe('GET /api/stores', () => {
        it('should return stores list', async () => {
            const response = await request('http://localhost:3000').get('/api/stores').expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter by status', async () => {
            const response = await request('http://localhost:3000')
                .get('/api/stores?status=approved')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /api/stores/my-stores (protected)', () => {
        it('should require authentication', async () => {
            await request('http://localhost:3000').get('/api/stores/my-stores').expect(401);
        });
    });

    describe('POST /api/stores (protected)', () => {
        it('should require authentication', async () => {
            await request('http://localhost:3000')
                .post('/api/stores')
                .send({ name: 'Test Store', slug: 'test-store' })
                .expect(401);
        });
    });

    describe('PUT /api/stores/:id (protected)', () => {
        it('should require authentication', async () => {
            await request('http://localhost:3000')
                .put('/api/stores/test-id')
                .send({ name: 'Updated Store' })
                .expect(401);
        });
    });

    describe('DELETE /api/stores/:id (protected)', () => {
        it('should require authentication', async () => {
            await request('http://localhost:3000').delete('/api/stores/test-id').expect(401);
        });
    });
});

describe('Reviews Integration', () => {
    describe('GET /api/reviews', () => {
        it('should return reviews list', async () => {
            const response = await request('http://localhost:3000').get('/api/reviews').expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /api/reviews/product/:productId', () => {
        it('should return reviews for product', async () => {
            const response = await request('http://localhost:3000')
                .get('/api/reviews/product/test-product')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});

describe('Admin Integration', () => {
    describe('GET /api/admin/stats (protected)', () => {
        it('should require admin authentication', async () => {
            await request('http://localhost:3000').get('/api/admin/stats').expect(401);
        });
    });
});
