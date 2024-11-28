const { getToken } = require('./config');
const axios = require('axios');


const apiClient = axios.create({
    baseURL: 'https://app.rollout.sh.test/api/v1',
    timeout: 5000,
});


apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

module.exports = apiClient;

