const request = require('supertest');
const db = require('../config/db');
const app = require('../index'); // Adjust path to your app entry point

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
