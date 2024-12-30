const { setDebug, debugLog } = require('../utils/debug');

const baseCommand = async (options) => {
    if (options.debug) {
        setDebug(true);
        debugLog('Debug mode enabled');
    }

    const fs = require('fs');
    const path = require('path');

    const versionFilePath = path.join(__dirname, '../../VERSION');
    const version = fs.readFileSync(versionFilePath, 'utf8').trim();

    console.log(`Rollout CLI version: ${version}`);

};

module.exports = { baseCommand };
