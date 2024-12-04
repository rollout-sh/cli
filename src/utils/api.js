const { getToken } = require('./config');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Determine environment (default to 'production' if undefined)
const env = process.env.NODE_ENV || 'production';

// Attempt to load the appropriate `.env` file
const dotenvPath = path.resolve(process.cwd(), `.env.${env}`);
const result = dotenv.config({ path: dotenvPath });

if (result.error) {
    // Log only in non-production environments
    if (env !== 'production') {
        console.error(`⚠️  Failed to load environment file: ${dotenvPath}`);
        console.error(result.error.message);
    }
} else {
    if (env !== 'production') {
        console.log(`✅ Loaded environment configuration from: ${dotenvPath}`);
    }
}

console.log(env);

// Fallback for `API_URL`
const API_URL = process.env.API_URL || (env === 'production'
    ? 'https://app.rollout.sh/api/v1'
    : 'https://app.rollout.sh.test/api/v1');

// Log API_URL in non-production environments for debugging
if (env !== 'production') {
    console.log(`Using API URL: ${API_URL}`);
}

// Create Axios client
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Authorization header dynamically
apiClient.interceptors.request.use((config) => {
    const token = getToken();
    console.log('Using token:', token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else if (env !== 'production') {
        console.warn('⚠️  No API token found. Requests may fail.');
    }
    return config;
});

// Handle errors globally (optional)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(`⚠️  API Request Failed: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return Promise.reject(error);
    }
);

module.exports = apiClient;
