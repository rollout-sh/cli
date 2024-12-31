#!/usr/bin/env node

const { program } = require('commander');

const login = require('./src/commands/login');
const register = require('./src/commands/register');
const logout = require('./src/commands/logout');
const showToken = require('./src/commands/token');

const { createApp, listApps, deleteApp, associateApp } = require('./src/commands/apps');

const { deploy, rollbackDeployment, deploymentStatus } = require('./src/commands/deploy');
const listDeployments = require('./src/commands/deployments');

const { addDomain, listDomains, removeDomain }  = require('./src/commands/domains');

const { billing, upgradePlan, addPaymentMethod, retryIncompletePayment, cancelSubscription, changeSubscription, resumeSubscription } = require('./src/commands/billing');

const showAnalytics = require('./src/commands/analytics');


program.command('login').description('Log in to Rollout').option('-d, --debug', 'Show debug information').action(login);
program.command('register').description('Register a new account').option('-d, --debug', 'Show debug information').action(register);
program.command('logout').description('Log out of Rollout').option('-d, --debug', 'Show debug information').action(logout);
program.command('token').description('Show stored token and user info').option('-d, --debug', 'Show debug information').action(showToken);


program.command('apps:create').description('Create a new app')
.option('-n, --name <name>', 'App Name')
.option('-d, --debug', 'Show debug information')
.action(createApp);

program.command('apps:list').description('List all apps').option('-d, --debug', 'Show debug information').action(listApps);
program.command('apps:delete').description('Delete an app').option('-d, --debug', 'Show debug information').action(deleteApp);
program.command('apps:associate').description('Associate a directory with an app').option('-d, --debug', 'Show debug information').action(associateApp);

program.command('deploy').description('Deploy static files to an app').option('-d, --debug', 'Show debug information').action(deploy);

program.command('deployments:list').description('List all deployments').option('-d, --debug', 'Show debug information').action(listDeployments);
program.command('deployments:rollback').description('Roll back to a previous deployment version').option('-d, --debug', 'Show debug information').action(rollbackDeployment);
program.command('deployments:status').description('Get deployment status').option('-d, --debug', 'Show debug information').action(deploymentStatus);




program
    .command('domains:add')
    .description('Add a new domain (standalone or associated with an app)')
    .option('-d, --debug', 'Show debug information')
    .action(addDomain);

program
    .command('domains:list')
    .description('List all domains or filter by app')
    .option('-d, --debug', 'Show debug information')
    .action(listDomains);

program
    .command('domains:remove')
    .description('Remove a domain by ID')
    .option('-d, --debug', 'Show debug information')
    .action(removeDomain);

program.command('billing:status').description('View billing status').option('-d, --debug', 'Show debug information').action(billing);
program.command('billing:payment-method').description('Add a new payment method').option('-d, --debug', 'Show debug information').action(addPaymentMethod);
program.command('billing:retry-incomplete').description('Retry incomplete payments').option('-d, --debug', 'Show debug information').action(retryIncompletePayment);
program.command('billing:upgrade').description('Upgrade to a new plan').option('-d, --debug', 'Show debug information').action(upgradePlan);
program.command('billing:cancel').description('Cancel subscription').option('-d, --debug', 'Show debug information').action(cancelSubscription);
program.command('billing:change').description('Change subscription').option('-d, --debug', 'Show debug information').action(changeSubscription);
program.command('billing:resume').description('Resume subscription').option('-d, --debug', 'Show debug information').action(resumeSubscription);

program.command('analytics').description('Show analytics for the current app').option('-d, --debug', 'Show debug information').action(showAnalytics);


program.parse(process.argv);