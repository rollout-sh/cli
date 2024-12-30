const { setDebug, debugLog } = require('../utils/debug');

const baseCommand = async (options) => {

    const fs = require('fs');
    const path = require('path');

    const versionFilePath = path.join(__dirname, '../../VERSION');
    const version = fs.readFileSync(versionFilePath, 'utf8').trim();

    console.log(`Rollout CLI version: ${version}`);

    if (options.debug) {
        setDebug(true);
        debugLog('Debug mode enabled');
    }

    
};

module.exports = { baseCommand };
