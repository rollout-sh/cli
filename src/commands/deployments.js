const { loadDeployments } = require('../utils/storage');

const listDeployments = async () => {
    const deployments = loadDeployments();

    if (deployments.length === 0) {
        console.log('No deployments found.');
        return;
    }

    console.log('Deployments:');
    deployments.forEach((deployment, index) => {
        console.log(`${index + 1}. App ID: ${deployment.app_id}`);
        console.log(`   Deployment ID: ${deployment.deployment_id}`);
        console.log(`   Status: ${deployment.status}`);
        console.log(`   URL: ${deployment.url}`);
        console.log(`   Timestamp: ${deployment.timestamp}`);
        console.log('---');
    });
};

module.exports = listDeployments;
