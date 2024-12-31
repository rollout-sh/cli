const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');
const micromatch = require('micromatch');
const JSZip = require('jszip');
const { loadApps } = require('../utils/storage');
const { apiClient } = require('../utils/api');
const { setDebug, debugLog } = require('../utils/debug');
const login = require('./login');
const { getToken } = require('../utils/config');


const parseIgnoreFile = (dirPath) => {
    const ignorePath = path.join(dirPath, '.rolloutignore');
    if (!fs.existsSync(ignorePath)) {
        debugLog('No .rolloutignore file found.');
        return [];
    }

    try {
        const patterns = fs.readFileSync(ignorePath, 'utf8')
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#'))
            .map((pattern) => (pattern.endsWith('/') ? `${pattern}**` : pattern));

        debugLog('Parsed .rolloutignore:', patterns);
        return patterns;
    } catch (error) {
        console.error(`Error reading .rolloutignore: ${error.message}`);
        return [];
    }
};

const collectFiles = (dirPath, basePath = '', ignorePatterns = []) => {
    const files = [];
    const items = fs.readdirSync(dirPath);

    // Common binary file extensions
    const binaryExtensions = [
        '.jpg', '.jpeg', '.png', '.gif', '.ico', '.pdf', '.zip',
        '.tar', '.gz', '.7z', '.mp3', '.mp4', '.wav', '.avi',
        '.mov', '.webp', '.woff', '.woff2', '.ttf', '.eot'
    ];

    items.forEach((item) => {
        const itemPath = path.join(dirPath, item);
        const relativePath = path.posix.join(basePath, item);
        const ext = path.extname(item).toLowerCase();

        debugLog(`Checking: ${relativePath}`);

        if (micromatch.isMatch(relativePath, ignorePatterns)) {
            debugLog(`Ignoring: ${relativePath}`);
            return;
        }

        if (fs.lstatSync(itemPath).isDirectory()) {
            debugLog(`Entering directory: ${relativePath}`);
            files.push(...collectFiles(itemPath, relativePath, ignorePatterns));
        } else {
            try {
                const buffer = fs.readFileSync(itemPath);
                const isBinary = binaryExtensions.includes(ext);

                // For binary files, use base64; for text files, use utf8
                const content = isBinary
                    ? buffer.toString('base64')
                    : buffer.toString('utf8');

                debugLog(`Including: ${relativePath} (${isBinary ? 'binary' : 'text'})`);
                files.push({
                    path: relativePath,
                    content,
                    isBinary
                });
            } catch (error) {
                console.error(`Error reading file ${itemPath}: ${error.message}`);
            }
        }
    });

    return files;
};

const uploadFiles = async (files, appId, progressBar, retries = 3) => {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressBar.update(i, { file: file.path });

        // Upload with retries
        let lastError;
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                debugLog(`Uploading file ${i + 1}/${files.length}: ${file.path} (Attempt ${attempt + 1})`);
                await apiClient.post(`/apps/${appId}/upload-file`, {
                    content: file.content,
                    path: file.path,
                    isBinary: file.isBinary
                });
                progressBar.update(i + 1);
                lastError = null;
                break;
            } catch (error) {
                lastError = error;
                debugLog(`Upload failed: ${error.message}`);
                if (attempt < retries - 1) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
                    debugLog(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        if (lastError) {
            throw lastError;
        }
    }
};

const deploy = async (options) => {
    if (options.debug) setDebug(true);

    // Check for authentication
    if (!getToken()) {
        console.log('Please log in to deploy your application:');
        await login(options);

        if (!getToken()) {
            console.error('Authentication failed. Unable to proceed with deployment.');
            return;
        }
    }

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

    // Initialize deployment
    try {
        const initResponse = await apiClient.post(`/apps/${associatedApp.id}/deploy/init`, {
            total_files: files.length
        });
        debugLog('Deployment initialized successfully:', initResponse.data);
    } catch (error) {
        console.error('Failed to initialize deployment:', error.response?.data?.message || error.message);
        return;
    }

    // Upload files with progress bar
    const progressBar = new cliProgress.SingleBar({
        format: ' {bar} {percentage}% | {value}/{total} files | {file}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
    }, cliProgress.Presets.shades_classic);

    progressBar.start(files.length, 0, { file: 'Starting...' });

    try {
        await uploadFiles(files, associatedApp.id, progressBar);
        progressBar.update(files.length, { file: 'Complete!' });
        progressBar.stop();
        console.log('All files uploaded successfully.');

        // Monitor deployment status
        const deploymentBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        deploymentBar.start(100, 0);

        let deploymentComplete = false;
        const maxAttempts = 30;
        let attempts = 0;

        while (!deploymentComplete && attempts < maxAttempts) {
            try {
                const statusResponse = await apiClient.get(`/apps/${associatedApp.id}/deployment-status`);
                const { status, progress } = statusResponse.data;

                deploymentBar.update(progress);
                debugLog('Deployment status:', { status, progress });

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
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            } catch (error) {
                deploymentBar.stop();
                console.error('Error checking deployment status:', error.response?.data?.message || error.message);
                deploymentComplete = true;
            }
        }

        if (!deploymentComplete) {
            deploymentBar.stop();
            console.error('Deployment status polling timed out.');
        }
    } catch (error) {
        progressBar.stop();
        console.error('File upload failed:', error.message);
        if (error.response?.data?.message) {
            console.error('Server message:', error.response.data.message);
        }
        process.exit(1);
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
