
const { program } = require('commander');
const login = require('./src/commands/login');
const register = require('./src/commands/register');
const { createApp, listApps, deleteApp } = require('./src/commands/apps');

program.command('login').description('Log in to Rollout').action(login);
program.command('register')
    .description('Register a new account')
    .action(register);

program.command('apps:create').description('Create a new app').action(createApp);
program.command('apps:list').description('List all apps').action(listApps);
program.command('apps:delete').description('Delete an app').action(deleteApp);



program.parse(process.argv);
