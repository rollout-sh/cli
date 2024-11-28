const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../config.json');

const saveToken = (token) => {
  fs.writeFileSync(configPath, JSON.stringify({ token }, null, 2));
};

const getToken = () => {
  if (!fs.existsSync(configPath)) return null;
  const { token } = JSON.parse(fs.readFileSync(configPath));
  return token;
};

module.exports = { saveToken, getToken };
