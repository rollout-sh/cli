
const { program } = require('commander');

const login = require('./src/commands/login');
const register = require('./src/commands/register');
const logout = require('./src/commands/logout');
const showToken = require('./src/commands/token');

const { createApp, listApps, deleteApp, associateApp } = require('./src/commands/apps');


const deploy = require('./src/commands/deploy');
const listDeployments = require('./src/commands/deployments');


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


program.parse(process.argv);