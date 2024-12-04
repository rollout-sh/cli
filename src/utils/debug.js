let isDebug = false;

const setDebug = (debug) => {
    isDebug = debug;
};

const debugLog = (...args) => {
    if (isDebug) {
        console.log('[DEBUG]', ...args);
    }
};

module.exports = { setDebug, debugLog };
