const { clearToken } = require('../utils/config');

const logout = async () => {
    clearToken();
};

module.exports = logout;
