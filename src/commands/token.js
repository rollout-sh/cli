const { getToken, getEmail } = require('../utils/config');

const showToken = () => {
    const token = getToken();
    const email = getEmail();
    if (!token) {
        console.log('No token found. Please log in.');
    } else {
        console.log(`Logged in as: ${email}`);
        console.log(`Token: ${token}`);
    }
};

module.exports = showToken;
