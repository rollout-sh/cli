<?php

// src/Command/WhoamiCommand.php

namespace Rollout\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Rollout\Service\ApiClientService;
use Rollout\Service\ConfigService;

#[AsCommand(
    name: 'whoami',
    description: 'Display the current authenticated user information'
)]
class WhoamiCommand extends BaseCommand {

    public function __construct(ConfigService $configService, ApiClientService $apiClientService) {
        parent::__construct($configService, $apiClientService);
    }

    protected function configure() {
    }

    protected function execute(InputInterface $input, OutputInterface $output): int {
        $io = new SymfonyStyle($input, $output);

        if ($this->isLoggingEnabled) {
            $io->note('Fetching current authenticated user information.');
        }

        $response = $this->apiClientService->makeApiRequest('GET', '/auth/whoami');

        if ($response['success'] && isset($response['data'])) {
            $userData = $response['data'];
            $io->success('You are logged in as:');
            $io->table(
                ['Field', 'Value'],
                [
                    ['Name', $userData['name']],
                    ['Email', $userData['email']],
                    // Add more fields as necessary
                ]
            );

            return Command::SUCCESS;
        } else {
            $io->error('Failed to retrieve user information. Please ensure you are logged in.');
            return Command::FAILURE;
        }
    }
}
