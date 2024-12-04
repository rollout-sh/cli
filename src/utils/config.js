const { saveToFile, loadFromFile, deleteFile } = require('./storage');
const { debugLog } = require('./debug'); // Import debug utility

const TOKEN_FILE = 'config.json';

// Save token to local storage
const saveToken = (token, email) => {
    saveToFile(TOKEN_FILE, { token, email });
    debugLog('Token saved to local storage:', { token, email });
    console.log('Token saved successfully!');
};

// Load token from local storage
const getToken = () => {
    const config = loadFromFile(TOKEN_FILE);
    debugLog('Loaded token from local storage:', config?.token || 'No token found');
    return config ? config.token : null;
};

// Load user email
const getEmail = () => {
    const config = loadFromFile(TOKEN_FILE);
    debugLog('Loaded email from local storage:', config?.email || 'No email found');
    return config ? config.email : null;
};

// Delete token
const clearToken = () => {
    deleteFile(TOKEN_FILE);
    debugLog('Token cleared from local storage.');
    console.log('Logged out successfully. Token cleared.');
};

module.exports = { saveToken, getToken, getEmail, clearToken };
