const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');
const micromatch = require('micromatch');
const inquirer = require('inquirer').default;
const { loadApps } = require('../utils/storage');
const apiClient = require('../utils/api');
const { exit } = require('process');

// Function to parse .rolloutignore file
const parseIgnoreFile = (dirPath) => {
    const ignorePath = path.join(dirPath, '.rolloutignore');
    if (!fs.existsSync(ignorePath)) {
        console.log('No .rolloutignore file found.');
        return [];
    }

    try {
        const patterns = fs.readFileSync(ignorePath, 'utf8')
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#')) // Ignore empty lines and comments
            .map((pattern) => (pattern.endsWith('/') ? `${pattern}**` : pattern)); // Normalize directory patterns

        console.log('Parsed .rolloutignore:', patterns); // Debugging line
        return patterns;
    } catch (error) {
        console.error(`Error reading .rolloutignore: ${error.message}`);
        return [];
    }
};

// Function to collect files, respecting ignore patterns
const collectFiles = (dirPath, basePath = '', ignorePatterns = []) => {
    const files = [];
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
        const itemPath = path.join(dirPath, item);
        const relativePath = path.posix.join(basePath, item); // Normalize to POSIX-style for consistency

        // Debugging: Show every path being evaluated
        console.log(`Checking: ${relativePath}`);

        // Skip ignored patterns
        if (micromatch.isMatch(relativePath, ignorePatterns)) {
            console.log(`Ignoring: ${relativePath}`);
            return;
        }

        if (fs.lstatSync(itemPath).isDirectory()) {
            // Recursively collect files from subdirectories, passing ignorePatterns
            console.log(`Entering directory: ${relativePath}`);
            files.push(...collectFiles(itemPath, relativePath, ignorePatterns));
        } else {
            try {
                const content = fs.readFileSync(itemPath, 'utf8');
                console.log(`Including: ${relativePath}`);
                files.push({ path: relativePath, content });
            } catch (error) {
                console.error(`Error reading file ${itemPath}: ${error.message}`);
            }
        }
    });

    return files;
};

const deploy = async () => {
    const apps = loadApps();
    const currentDir = process.cwd();

    const associatedApp = apps.find((app) => app.directory === currentDir);

    if (!associatedApp) {
        console.error('No app is associated with this directory. Use "rollout apps:associate" to link this directory to an app.');
        return;
    }

    console.log(`Detected app: ${associatedApp.name}`);

    const ignorePatterns = parseIgnoreFile(currentDir);
    const files = collectFiles(currentDir, '', ignorePatterns);

    console.log(`Collected ${files.length} files for deployment.`);

    // Step 1: Initialize deployment
    try {
        const initResponse = await apiClient.post(`/apps/${associatedApp.id}/deploy/init`, { total_files: files.length });
        console.log('Deployment initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize deployment:', error.response?.data?.message || error.message);
        return;
    }

    // Step 2: Upload files
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(files.length, 0);

    try {
        for (const file of files) {
            await apiClient.post(`/apps/${associatedApp.id}/upload`, file);
            progressBar.increment();
        }
        progressBar.stop();
        console.log('All files uploaded successfully.');
    } catch (error) {
        progressBar.stop();
        console.error('File upload failed:', error.response?.data?.message || error.message);
        return;
    }

    // Step 3: Monitor deployment status
    const deploymentBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    deploymentBar.start(100, 0);

    let deploymentComplete = false;
    const maxAttempts = 30; // Limit polling to 30 attempts (e.g., 1 minute with 2-second intervals)
    let attempts = 0;

    while (!deploymentComplete && attempts < maxAttempts) {
        try {
            const statusResponse = await apiClient.get(`/apps/${associatedApp.id}/deployment-status`);
            const { status, progress } = statusResponse.data;

            deploymentBar.update(progress);

            console.log(status, progress);

            if (status === 'deployed') {
                deploymentComplete = true;
                deploymentBar.stop();
                console.log('Deployment completed successfully.');
                console.log(`URL: https://${associatedApp.subdomain}`);
            } else if (status === 'failed') {
                deploymentComplete = true;
                deploymentBar.stop();
                console.error('Deployment failed.');
            } else {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
            }
        } catch (error) {
            deploymentBar.stop();
            console.error('Error checking deployment status:', error.response?.data?.message || error.message);
            deploymentComplete = true; // Exit loop on error
        }
    }

    if (!deploymentComplete) {
        deploymentBar.stop();
        console.error('Deployment status polling timed out.');
    }
};

// Rollback command
const rollbackDeployment = async () => {
    const apps = loadApps();
    const currentDir = process.cwd();

    const associatedApp = apps.find((app) => app.directory === currentDir);

    if (!associatedApp) {
        console.error(
            'No app is associated with this directory. Use "rollout apps:associate" to link this directory to an app.'
        );
        return;
    }

    const answers = await inquirer.prompt([
        { type: 'input', name: 'version', message: 'Version to roll back to:' },
    ]);

    try {
        const response = await apiClient.post(`/apps/${associatedApp.id}/rollback`, {
            version: answers.version,
        });
        console.log(`Rolled back to version ${answers.version} successfully!`);
        console.log(`URL: ${response.data.url}`);
    } catch (error) {
        console.error('Rollback failed:', error.response?.data?.message || error.message);
    }
};

// Deployment status command
const deploymentStatus = async () => {
    const apps = loadApps();
    const currentDir = process.cwd();

    const associatedApp = apps.find((app) => app.directory === currentDir);

    if (!associatedApp) {
        console.error(
            'No app is associated with this directory. Use "rollout apps:associate" to link this directory to an app.'
        );
        return;
    }

    try {
        const response = await apiClient.get(`/apps/${associatedApp.id}/status`);
        console.log('Deployment Status:');
        response.data.forEach((deployment) => {
            console.log(`Version: ${deployment.version}`);
            console.log(`Status: ${deployment.status}`);
            console.log(`Active: ${deployment.is_active}`);
            console.log('---');
        });
    } catch (error) {
        console.error('Failed to fetch deployment status:', error.response?.data?.message || error.message);
    }
};

module.exports = { rollbackDeployment, deploy, deploymentStatus };
