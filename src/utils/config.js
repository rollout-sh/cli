const { saveToFile, loadFromFile, deleteFile } = require('./storage');

const TOKEN_FILE = 'config.json';

// Save token to local storage
const saveToken = (token, email) => {
    saveToFile(TOKEN_FILE, { token, email });
    console.log('Token saved successfully!');
};

// Load token from local storage
const getToken = () => {
    const config = loadFromFile(TOKEN_FILE);
    return config ? config.token : null;
};

// Load user email
const getEmail = () => {
    const config = loadFromFile(TOKEN_FILE);
    return config ? config.email : null;
};

// Delete token
const clearToken = () => {
    deleteFile(TOKEN_FILE);
    console.log('Logged out successfully. Token cleared.');
};

module.exports = { saveToken, getToken, getEmail, clearToken };
