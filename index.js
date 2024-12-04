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


program.command('login').description('Log in to Rollout').action(login);
program.command('register').description('Register a new account').action(register);
program.command('logout').description('Log out of Rollout').action(logout);
program.command('token').description('Show stored token and user info').action(showToken);


program.command('apps:create').description('Create a new app').action(createApp);
program.command('apps:list').description('List all apps').action(listApps);
program.command('apps:delete').description('Delete an app').action(deleteApp);
program.command('apps:associate').description('Associate a directory with an app').action(associateApp);




program.command('deploy').description('Deploy static files to an app').action(deploy);
program.command('deployments:list').description('List all deployments').action(listDeployments);
program.command('deployments:rollback').description('Roll back to a previous deployment version').action(rollbackDeployment);
program.command('deployments:status').description('Get deployment status').action(deploymentStatus);



program.command('domains:add').description('Add a custom domain').action(addDomain);
program.command('domains:list').description('List custom domains').action(listDomains);
program.command('domains:remove').description('Remove a custom domain').action(removeDomain);

program.command('billing:status').description('View billing status').action(billing);
program.command('billing:payment-method').description('Add a new payment method').action(addPaymentMethod);
program.command('billing:retry-incomplete').description('Retry incomplete payments').action(retryIncompletePayment);
program.command('billing:upgrade').description('Upgrade to a new plan').action(upgradePlan);
program.command('billing:cancel').description('Cancel subscription').action(cancelSubscription);
program.command('billing:change').description('Change subscription').action(changeSubscription);
program.command('billing:resume').description('Resume subscription').action(resumeSubscription);


program.parse(process.argv);