const { apiClient}  = require('../utils/api');
const { loadApps } = require('../utils/storage');

const showAnalytics = async () => {
    const apps = loadApps();
    const currentDir = process.cwd();

    const associatedApp = apps.find((app) => app.directory === currentDir);

    if (!associatedApp) {
        console.error('No app is associated with this directory. Use "rollout apps:associate" to link this directory to an app.');
        return;
    }

    try {
        const response = await apiClient.get(`/apps/${associatedApp.id}/analytics`);
        const data = response.data;

        console.log(`\nAnalytics for App: ${associatedApp.name}`);
        console.log('----------------------------------');
        console.log(`Total Deployments: ${data.total_deployments}`);
        console.log(`Latest Deployment:`);
        if (data.latest_deployment) {
            console.log(`  ID: ${data.latest_deployment.id}`);
            console.log(`  Status: ${data.latest_deployment.status}`);
            console.log(`  Timestamp: ${data.latest_deployment.timestamp}`);
        } else {
            console.log('  No deployments yet.');
        }
        console.log(`Deployment Success Rate: ${data.success_rate.toFixed(2)}%`);
        console.log(`Failed Deployments: ${data.failed_deployments}`);
        console.log(`Total Storage Used: ${(data.total_storage_used / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`Bandwidth Used (Simulated): ${(data.bandwidth_used / (1024 * 1024)).toFixed(2)} MB`);
    } catch (error) {
        console.error('Failed to fetch analytics:', error.response?.data?.message || error.message);
    }
};

module.exports = showAnalytics;
