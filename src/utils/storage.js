const fs = require('fs');
const path = require('path');
const os = require('os');
const { debugLog } = require('./debug'); // Import debug utility

// Base directory for .rollout files
const baseDir = path.join(os.homedir(), '.rollout');
const APPS_FILE = 'apps.json';
const DEPLOYMENTS_FILE = 'deployments.json';

// Ensure .rollout directory exists
const ensureBaseDir = () => {
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
        debugLog(`Created directory: ${baseDir}`);
    } else {
        debugLog(`Directory already exists: ${baseDir}`);
    }
};

// Get the path to a specific file in .rollout
const getFilePath = (filename) => {
    const filePath = path.join(baseDir, filename);
    debugLog(`Resolved file path: ${filePath}`);
    return filePath;
};

// Save data to a specific file
const saveToFile = (filename, data) => {
    try {
        ensureBaseDir();
        const filePath = getFilePath(filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
        debugLog(`File saved successfully to: ${filePath}`);
    } catch (error) {
        console.error(`Error saving file ${filename}: ${error.message}`);
    }
};

// Load data from a specific file
const loadFromFile = (filename) => {
    ensureBaseDir();
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) {
        debugLog(`File not found: ${filePath}`);
        return null;
    }
    try {
        const data = JSON.parse(fs.readFileSync(filePath));
        debugLog(`Loaded data from file: ${filename}`, data);
        return data;
    } catch (error) {
        console.error(`Error reading file ${filename}: ${error.message}`);
        return null;
    }
};

// Delete a specific file
const deleteFile = (filename) => {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        debugLog(`Deleted file: ${filePath}`);
    } else {
        debugLog(`File not found for deletion: ${filePath}`);
    }
};

// Save apps metadata to local storage
const saveApps = (apps) => {
    debugLog('Saving apps metadata:', apps);
    saveToFile(APPS_FILE, { apps });
};

// Load apps metadata from local storage
const loadApps = () => {
    const data = loadFromFile(APPS_FILE);
    debugLog('Loaded apps metadata:', data ? data.apps : []);
    return data ? data.apps : [];
};

// Save deployments metadata to local storage
const saveDeployments = (deployments) => {
    debugLog('Saving deployments metadata:', deployments);
    saveToFile(DEPLOYMENTS_FILE, { deployments });
};

// Load deployments metadata from local storage
const loadDeployments = () => {
    const data = loadFromFile(DEPLOYMENTS_FILE);
    debugLog('Loaded deployments metadata:', data ? data.deployments : []);
    return data ? data.deployments : [];
};

module.exports = {
    saveDeployments,
    loadDeployments,
    saveApps,
    loadApps,
    saveToFile,
    loadFromFile,
    deleteFile,
    getFilePath,
};
