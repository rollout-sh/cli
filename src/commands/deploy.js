const fs = require('fs');
const path = require('path');
const apiClient = require('../utils/api');
const inquirer = require('inquirer').default;
const { loadApps } = require('../utils/storage');

const { saveDeployments, loadDeployments } = require('../utils/storage');

// const deploy = async () => {
//     const answers = await inquirer.prompt([
//         { type: 'input', name: 'app', message: 'App Name or ID:' },
//         { type: 'input', name: 'directory', message: 'Path to static files:' },
//     ]);

//     const files = [];
//     const dirPath = path.resolve(answers.directory);

//     fs.readdirSync(dirPath).forEach((file) => {
//         const filePath = path.join(dirPath, file);
//         files.push({
//             path: file,
//             content: fs.readFileSync(filePath, 'utf8'),
//         });
//     });

//     try {
//         const response = await apiClient.post(`/apps/${answers.app}/deploy`, { files });

//         // Cache deployment metadata
//         const deployments = loadDeployments();
//         deployments.push({
//             app_id: answers.app,
//             deployment_id: response.data.deployment.id,
//             status: response.data.deployment.status,
//             url: response.data.url,
//             timestamp: new Date().toISOString(),
//         });
//         saveDeployments(deployments);

//         console.log('Deployment successful!');
//         console.log(`URL: ${response.data.url}`);
//     } catch (error) {
//         console.error('Deployment failed:', error.response?.data?.message || error.message);
//     }
// };


const collectFiles = (dirPath, basePath = '') => {
    const files = [];
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
        const itemPath = path.join(dirPath, item);
        const relativePath = path.join(basePath, item);

        if (fs.lstatSync(itemPath).isDirectory()) {
            // Recursively collect files from subdirectories
            files.push(...collectFiles(itemPath, relativePath));
        } else {
            try {
                const content = fs.readFileSync(itemPath, 'utf8');
                files.push({ path: relativePath, content });
            } catch (error) {
                console.error(`Error reading file ${itemPath}:`, error.message);
            }
        }
    });

    return files;
};


const deploy = async () => {
    const apps = loadApps();
    const currentDir = process.cwd();

    // Detect associated app
    const associatedApp = apps.find((app) => app.directory === currentDir);

    if (!associatedApp) {
        console.error(
            'No app is associated with this directory. Use "rollout apps:associate" to link this directory to an app.'
        );
        return;
    }

    console.log(`Detected app: ${associatedApp.name}`);

    // Collect all files from the current directory
    const files = collectFiles(currentDir);
    console.log('Collected files for deployment:', files); // Debugging line

    console.log('Payload being sent to API:', { files });


    try {
        const response = await apiClient.post(`/apps/${associatedApp.id}/deploy`, { files });
        console.log('Deployment successful!');
        console.log(`URL: ${response.data.url}`);
    } catch (error) {
        console.error('Deployment failed:', error.response?.data?.message || error.message);
    }
};

module.exports = deploy;
