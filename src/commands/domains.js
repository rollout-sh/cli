const { loadApps } = require('../utils/storage');
const inquirer = require('inquirer').default;
const apiClient = require('../utils/api');

const addDomain = async () => {
    const apps = loadApps();
    const currentDir = process.cwd();

    // Detect the associated app
    const associatedApp = apps.find((app) => app.directory === currentDir);

    let appId;
    if (associatedApp) {
        appId = associatedApp.id;
        console.log(`Detected app: ${associatedApp.name}`);
    } else {
        // Prompt for app ID if no associated app is found
        const answers = await inquirer.prompt([
            { type: 'input', name: 'app', message: 'App ID or Name:' },
        ]);
        appId = answers.app;
    }

    // Prompt for the custom domain
    const domainAnswer = await inquirer.prompt([
        { type: 'input', name: 'domain', message: 'Custom Domain:' },
    ]);

    try {
        const response = await apiClient.post(`/apps/${appId}/domains`, {
            domain: domainAnswer.domain,
        });

        console.log('Domain added successfully!');
        console.log('Please add the following DNS record to verify ownership:');
        console.log(`Type: ${response.data.verification_record.type}`);
        console.log(`Name: ${response.data.verification_record.name}`);
        console.log(`Value: ${response.data.verification_record.value}`);
    } catch (error) {
        console.error('Failed to add domain:', error.response?.data?.message || error.message);
    }
};

const listDomains = async () => {
    const answers = await inquirer.prompt([{ type: 'input', name: 'app', message: 'App ID:' }]);

    try {
        const response = await apiClient.get(`/apps/${answers.app}/domains`);
        console.log('Domains:');
        response.data.forEach((domain, index) => {
            console.log(`${index + 1}. Domain: ${domain.domain} (Status: ${domain.status})`);
        });
    } catch (error) {
        console.error('Failed to list domains:', error.response?.data?.message || error.message);
    }
};

const removeDomain = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'domainId', message: 'Domain ID to remove:' },
    ]);

    try {
        await apiClient.delete(`/domains/${answers.domainId}`);
        console.log('Domain removed successfully!');
    } catch (error) {
        console.error('Failed to remove domain:', error.response?.data?.message || error.message);
    }
};

module.exports = { addDomain, listDomains, removeDomain };
