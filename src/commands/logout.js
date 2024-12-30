const { clearToken } = require('../utils/config');
const { baseCommand } = require('./baseCommand');

const logout = async (options) => {
    await baseCommand(options); // This will set debug mode if -d or --debug is provided
    clearToken();
};

module.exports = logout;
