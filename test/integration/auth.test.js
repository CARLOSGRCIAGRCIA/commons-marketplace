import request from 'supertest';

describe('Auth Integration', () => {
    describe('POST /api/auth/register', () => {
        it('should reject invalid email', async () => {
            const response = await request('http://localhost:3000')
                .post('/api/auth/register')
                .send({ email: 'invalid' })
                .expect(400);
            expect(response.body.error).toBeDefined();
        });

        it('should reject weak password', async () => {
            const response = await request('http://localhost:3000')
                .post('/api/auth/register')
                .send({ email: 'test@test.com', password: '123' })
                .expect(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe('POST /api/auth/login', () => {
        it('should handle missing credentials', async () => {
            const response = await request('http://localhost:3000')
                .post('/api/auth/login')
                .send({})
                .expect(400);
            expect(response.body.error).toBeDefined();
        });

        it('should handle invalid credentials', async () => {
            await request('http://localhost:3000')
                .post('/api/auth/login')
                .send({ email: 'nonexist@test.com', password: 'wrongpassword' })
                .expect(401);
        });
    });
});

describe('Health Check', () => {
    describe('GET /health', () => {
        it('should return OK status', async () => {
            const response = await request('http://localhost:3000')
                .get('/health')
                .expect(200);
            expect(response.body.status).toBe('OK');
        });

        it('should include environment info', async () => {
            const response = await request('http://localhost:3000')
                .get('/health')
                .expect(200);
            expect(response.body.environment).toBeDefined();
            expect(response.body.service).toBe('commons-marketplace');
        });
    });
});

describe('Rate Limiting', () => {
    it('should include rate limit headers', async () => {
        const response = await request('http://localhost:3000')
            .get('/health');
        expect(response.headers['ratelimit-limit']).toBeDefined();
    });
});