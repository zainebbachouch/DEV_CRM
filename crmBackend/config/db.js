const jest = require('jest');

let mockInsertId = 91; // Start with the last known ID
let mockCategories = []; // Mocked in-memory categories

const mockQuery = jest.fn((sql, params, callback) => {
    if (sql.includes('INSERT')) {
        mockInsertId++; // Increment ID for the new category
        const newCategory = { idcategorie: mockInsertId, ...params[0] }; // Ensure idcategorie is set
        mockCategories.push(newCategory); // Add the new category to the in-memory array
        callback(null, { insertId: mockInsertId, affectedRows: 1 }); // Return success response
    } else if (sql.includes('SELECT')) {
        if (sql.includes('FROM categorie WHERE')) {
            const idToFind = params[0];
            const result = mockCategories.filter(cat => cat.idcategorie === idToFind);
            callback(null, result);
        } else {
            callback(null, mockCategories);
        }
    } else {
        callback(null, []); // Default response for unsupported queries
    }
});

mockQuery.end = jest.fn(() => Promise.resolve());

module.exports = { query: mockQuery, end: mockQuery.end };