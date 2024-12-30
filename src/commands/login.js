const inquirer = require('inquirer').default;
const { apiClient } = require('../utils/api');
const { saveToken } = require('../utils/config');
const { setDebug, debugLog } = require('../utils/debug');
const { baseCommand } = require('./baseCommand');

/**
 * This command is used to login the user.
 * It prompts the user for their email and password, and then sends a login request to the API.
 * @param {Object} options - The options object.
 * @param {boolean} options.debug - If true, enables debug mode.
 */
const login = async (options) => {
    await baseCommand(options); // This will set debug mode if -d or --debug is provided

    const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Email:' },
        { type: 'password', name: 'password', message: 'Password:' },
    ]);

    try {
        debugLog('Sending login request with:', answers);
        const response = await apiClient.post('/login', answers);
        debugLog('API Response:', response.data);
        saveToken(response.data.token, answers.email);
        console.log('Login successful!');
    } catch (error) {
        debugLog('Error during login:', error);
        console.error('Login failed:', error.response?.data?.message || error.message);
    }
};

module.exports = login;
