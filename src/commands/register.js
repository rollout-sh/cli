const inquirer = require('inquirer').default;
const { apiClient } = require('../utils/api');
const { setDebug, debugLog } = require('../utils/debug');

const register = async (options) => {
    if (options.debug) setDebug(true);

    debugLog('Debug mode enabled for registration.');

    const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Name:' },
        { type: 'input', name: 'email', message: 'Email:' },
        { type: 'password', name: 'password', message: 'Password:' },
        { type: 'password', name: 'password_confirmation', message: 'Confirm Password:' },
    ]);

    try {
        const response = await apiClient.post('/register', answers);
        debugLog('API Response:', response.data);
        console.log('Registration successful! You can now log in using your credentials.');
    } catch (error) {
        debugLog('Error:', error);
        console.error('Registration failed:', error.response?.data?.message || error.message);
    }
};

module.exports = register;