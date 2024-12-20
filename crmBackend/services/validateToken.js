const jwt = require('jsonwebtoken');
require('dotenv').config();
// const { storeRefreshToken } = require('../controllers/userController');

const isAuthorize = async (req) => {
    try {
        // Check if authorization header is present
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return { message: 'Unauthorized' };
        }

        // Extract and verify the token
        const authToken = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(authToken, process.env.JWT_SECRET);

        if (!decode) {
            return { message: 'Unauthorized' };
        }

        // Generate a new refresh token (if needed)
       

        // Uncomment this if you intend to use the refresh token
        // storeRefreshToken(decode.email, refreshToken);

        // Return response
        return {
            message: 'authorized',
            decode,
            // Uncomment this if you want to return the refresh token
            // refreshToken,
        };
    } catch (error) {
        console.log(error.message);
        return { message: 'Server error' };
    }
};

module.exports = { isAuthorize };
