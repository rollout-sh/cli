const { clearToken } = require('../utils/config');
const { baseCommand } = require('./baseCommand');

/**
 * This command is used to logout the user.
 * It clears the token from the local storage.
 * @param {Object} options - The options object.
 * @param {boolean} options.debug - If true, enables debug mode.
 */
const logout = async (options) => {
    await baseCommand(options); // This will set debug mode if -d or --debug is provided
    clearToken();
};

module.exports = logout;
