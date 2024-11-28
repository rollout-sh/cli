const inquirer = require('inquirer').default;
const apiClient = require('../utils/api');
const { saveApps, loadApps } = require('../utils/storage');


const createApp = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'App Name:' },
    ]);

    try {
        const response = await apiClient.post('/apps', answers);
        console.log('App created successfully!');
        console.log(`Name: ${response.data.name}`);
        console.log(`Subdomain: ${response.data.subdomain}`);
    } catch (error) {
        console.error('Failed to create app:', error.response?.data?.message || error.message);
    }
};



const listApps = async () => {
    try {
        const response = await apiClient.get('/apps');
        saveApps(response.data); // Cache apps locally
        console.log('Your Apps:');
        response.data.forEach((app, index) => {
            console.log(`${index + 1}. Name: ${app.name}, Subdomain: ${app.subdomain}`);
        });
    } catch (error) {
        console.error('Failed to list apps:', error.response?.data?.message || error.message);
        console.log('Fetching cached data...');
        const cachedApps = loadApps();
        if (cachedApps.length === 0) {
            console.log('No cached data available.');
        } else {
            cachedApps.forEach((app, index) => {
                console.log(`${index + 1}. Name: ${app.name}, Subdomain: ${app.subdomain}`);
            });
        }
    }
};

const deleteApp = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'id', message: 'App ID to delete:' },
    ]);

    try {
        await apiClient.delete(`/apps/${answers.id}`);
        console.log('App deleted successfully!');
    } catch (error) {
        console.error('Failed to delete app:', error.response?.data?.message || error.message);
    }
};

module.exports = { createApp, listApps, deleteApp };