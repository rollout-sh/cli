const fs = require('fs');
const path = require('path');
const apiClient = require('../utils/api');
const inquirer = require('inquirer').default;

const { saveDeployments, loadDeployments } = require('../utils/storage');

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

        // Cache deployment metadata
        const deployments = loadDeployments();
        deployments.push({
            app_id: answers.app,
            deployment_id: response.data.deployment.id,
            status: response.data.deployment.status,
            url: response.data.url,
            timestamp: new Date().toISOString(),
        });
        saveDeployments(deployments);

        console.log('Deployment successful!');
        console.log(`URL: ${response.data.url}`);
    } catch (error) {
        console.error('Deployment failed:', error.response?.data?.message || error.message);
    }
};

module.exports = deploy;
