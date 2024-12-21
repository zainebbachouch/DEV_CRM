const request = require('supertest');
const { app, server } = require('../index'); // Import app, server, and io

jest.mock('../services/validateToken', () => ({
    isAuthorize: jest.fn(() => ({
        message: 'authorized',
        decode: {
            idadmin: 1,
            role: 'admin',
            nom_admin: 'ee',
            prenom_admin: 'ee',
            email_admin: 'zainebbachouch262@gmail.com',
        },
    })),
}));

let testHttpServer, testSocketServer;


beforeAll(async () => {
    const TEST_PORT = 6000; // Use test-specific HTTP port
    const TEST_SOCKET_PORT = 9000; // Use test-specific Socket port

    // Start test HTTP server
    testHttpServer = app.listen(TEST_PORT, () => {
        console.log(`Test HTTP server running on port ${TEST_PORT}`);
    });

    // Start test Socket server
    testSocketServer = server.listen(TEST_SOCKET_PORT, () => {
        console.log(`Test Socket server running on port ${TEST_SOCKET_PORT}`);
    });

    // Ensure both servers are started before proceeding
    await new Promise((resolve) => setTimeout(resolve, 500));
});

afterAll(async () => {
    // Close both test servers after all tests
    if (testHttpServer) {
        await new Promise((resolve) => testHttpServer.close(resolve));
        console.log('Test HTTP server closed.');
    }

    if (testSocketServer) {
        await new Promise((resolve) => testSocketServer.close(resolve));
        console.log('Test Socket server closed.');
    }
});

describe('Category Routes - Add and Fetch Only', () => {
    test('POST /api/createCategorie - Create a new category', async () => {
        const newCategory = {
            nom_categorie: `Furniture-${Date.now()}`, // Unique name
            description: 'Home and office furniture',
        };
        const response = await request(app).post('/api/createCategorie').send(newCategory);

        console.log('POST Response:', response.body);

        expect(response.statusCode).toBe(200);
        expect(response.body.idcategorie).toBeDefined(); // Ensure ID is returned
    });

    test('GET /api/getAllCategories - Fetch all categories', async () => {
        const response = await request(app).get('/api/getAllCategories?page=1&limit=5');

        console.log('GET Response:', response.body.categories);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.categories)).toBe(true);
        expect(response.body.categories.length).toBeGreaterThan(0); // Ensure categories are present
    });
});