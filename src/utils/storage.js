const fs = require('fs');
const path = require('path');
const os = require('os');

// Base directory for .rollout files
const baseDir = path.join(os.homedir(), '.rollout');
const APPS_FILE = 'apps.json';
const DEPLOYMENTS_FILE = 'deployments.json';



// Ensure .rollout directory exists
const ensureBaseDir = () => {
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
        console.log(`Created directory: ${baseDir}`);
    }
};

// Get the path to a specific file in .rollout
const getFilePath = (filename) => path.join(baseDir, filename);

// Save data to a specific file
const saveToFile = (filename, data) => {
    ensureBaseDir();
    fs.writeFileSync(getFilePath(filename), JSON.stringify(data, null, 2), { mode: 0o600 });
};

// Load data from a specific file
const loadFromFile = (filename) => {
    ensureBaseDir();
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath));
};

// Delete a specific file
const deleteFile = (filename) => {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};


// Save apps metadata to local storage
const saveApps = (apps) => saveToFile(APPS_FILE, { apps });

// Load apps metadata from local storage
const loadApps = () => {
    const data = loadFromFile(APPS_FILE);
    return data ? data.apps : [];
};


// Save deployments metadata to local storage
const saveDeployments = (deployments) => saveToFile(DEPLOYMENTS_FILE, { deployments });

// Load deployments metadata from local storage
const loadDeployments = () => {
    const data = loadFromFile(DEPLOYMENTS_FILE);
    return data ? data.deployments : [];
};

module.exports = { saveDeployments, loadDeployments, saveApps, loadApps, saveToFile, loadFromFile, deleteFile, getFilePath };

