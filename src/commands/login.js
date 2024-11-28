const inquirer = require('inquirer').default;
const apiClient = require('../utils/api');
const { saveToken } = require('../utils/config');

const login = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Email:' },
        { type: 'password', name: 'password', message: 'Password:' },
    ]);

    try {
        const response = await apiClient.post('/login', answers);
        saveToken(response.data.token, answers.email);
        console.log('Login successful!');
    } catch (error) {
        console.error('Login failed:', error.response?.data?.message || error.message);
    }
};

module.exports = login;
