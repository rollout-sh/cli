const { loadApps } = require('../utils/storage');
const inquirer = require('inquirer').default;
const { apiClient } = require('../utils/api');


const addDomain = async () => {
    const apps = loadApps();

    // Prompt user to associate domain with an app or leave it standalone
    const associateAnswer = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'associateWithApp',
            message: 'Do you want to associate this domain with an app?',
            default: false,
        },
    ]);

    let appId = null;

    if (associateAnswer.associateWithApp) {
        const appChoices = apps.map((app) => ({
            name: app.name,
            value: app.id,
        }));

        if (appChoices.length === 0) {
            console.log('No apps found. Please create an app first.');
            return;
        }

        const appAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'appId',
                message: 'Select an app to associate the domain:',
                choices: appChoices,
            },
        ]);

        appId = appAnswer.appId;
    }

    const domainAnswer = await inquirer.prompt([
        { type: 'input', name: 'domain', message: 'Enter the custom domain:' },
    ]);

    try {
        const response = await apiClient.post('/domains', {
            domain: domainAnswer.domain,
            app_id: appId,
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
    const filterAnswer = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'filterByApp',
            message: 'Do you want to filter domains by app?',
            default: false,
        },
    ]);

    let appId = null;

    if (filterAnswer.filterByApp) {
        const apps = loadApps();
        const appChoices = apps.map((app) => ({
            name: app.name,
            value: app.id,
        }));

        if (appChoices.length === 0) {
            console.log('No apps found. Please create an app first.');
            return;
        }

        const appAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'appId',
                message: 'Select an app to filter domains:',
                choices: appChoices,
            },
        ]);

        appId = appAnswer.appId;
    }

    try {
        const response = await apiClient.get('/domains', { params: { app_id: appId } });
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
        { type: 'input', name: 'domainId', message: 'Enter the Domain ID to remove:' },
    ]);

    try {
        await apiClient.delete(`/domains/${answers.domainId}`);
        console.log('Domain removed successfully!');
    } catch (error) {
        console.error('Failed to remove domain:', error.response?.data?.message || error.message);
    }
};

module.exports = { addDomain, listDomains, removeDomain };
