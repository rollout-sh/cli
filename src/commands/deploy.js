const fs = require('fs');
const path = require('path');
const apiClient = require('../utils/api');
const inquirer = require('inquirer').default;

const deploy = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'app', message: 'App Name or ID:' },
        { type: 'input', name: 'directory', message: 'Path to static files:' },
    ]);

    const files = [];
    const dirPath = path.resolve(answers.directory);

    fs.readdirSync(dirPath).forEach((file) => {
        const filePath = path.join(dirPath, file);
        files.push({
            path: file,
            content: fs.readFileSync(filePath, 'utf8'),
        });
    });

    try {
        const response = await apiClient.post(`/apps/${answers.app}/deploy`, { files });
        console.log('Deployment successful!');
        console.log(`URL: ${response.data.url}`);
    } catch (error) {
        console.error('Deployment failed:', error.response?.data?.message || error.message);
    }
};

module.exports = deploy;
