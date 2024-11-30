

const inquirer = require('inquirer').default;
const apiClient = require('../utils/api');
// const { default: open } = await import('open'); // Dynamic import for ES modules

const openUrl = async (url) => {
    try {
        const open = (await import('open')).default; // Dynamically import `open`
        await open(url);
        console.log('Browser opened for authentication...');
    } catch (error) {
        console.error('Error opening browser:', error.message);
    }
};


const billing = async () => {
    
    try {
        const response = await apiClient.get('/billing/status');
        console.log('Billing Status:');
        console.log(`Plan: ${response.data.plan}`);
        console.log('Usage:');
        console.log(`  Apps: ${response.data.usage.apps}/${response.data.limits.apps}`);
        console.log(`  Bandwidth: ${response.data.usage.bandwidth}/${response.data.limits.bandwidth}`);
    } catch (error) {
        console.error('Failed to fetch billing status:', error.response?.data?.message || error.message);
    }
};


const retryIncompletePayment = async () => {
    try {
        const { data } = await apiClient.get('/billing/retry-incomplete');

        if (data.payment_url) {
            console.log('Redirecting to resolve incomplete payment...');
            await openUrl(data.payment_url);
        } else {
            console.log('No incomplete payments found.');
        }
    } catch (error) {
        console.error('Failed to retry payment:', error.response?.data?.message || error.message);
    }
};

const addPaymentMethod = async () => {
    try {
        console.log('Requesting a setup intent...');
        const response = await apiClient.post('/billing/setup-intent');
        const clientSecret = response.data.client_secret;

        const cardDetails = await inquirer.prompt([
            { type: 'input', name: 'number', message: 'Card Number:' },
            { type: 'input', name: 'exp_month', message: 'Expiry Month (MM):' },
            { type: 'input', name: 'exp_year', message: 'Expiry Year (YYYY):' },
            { type: 'input', name: 'cvc', message: 'CVC:' },
        ]);

        console.log('Submitting card details...');
        const paymentMethodResponse = await apiClient.post('/billing/add-payment-method', {
            card: cardDetails,
            setup_intent: clientSecret,
        });

        if (paymentMethodResponse.data.requires_action) {
            console.log('Authentication required. Redirecting to browser...');
            await openUrl(paymentMethodResponse.data.auth_url);

            console.log('Waiting for confirmation...');
            const status = await apiClient.get('/billing/payment-status', {
                params: { intent_id: clientSecret },
            });

            if (status.data.success) {
                console.log('Payment method added successfully!');
            } else {
                console.error('Authentication failed. Please try again.');
            }
        } else {
            console.log('Payment method added successfully!');
        }
    } catch (error) {
        console.error('Failed to add payment method:', error.response?.data?.message || error.message);
    }
};




// const upgradePlan = async () => {
//     try {
//         const response = await apiClient.get('/plans'); // Fetch plans
//         const plans = response.data.map((plan) => ({
//             name: `${plan.name} ($${plan.price}/month)`,
//             value: plan.id,
//         }));

//         const answers = await inquirer.prompt([
//             {
//                 type: 'list',
//                 name: 'plan_id',
//                 message: 'Choose a plan to upgrade:',
//                 choices: plans,
//             },
//         ]);

//         // Prompt for card details
//         const cardDetails = await inquirer.prompt([
//             { type: 'input', name: 'card_number', message: 'Card Number:' },
//             { type: 'input', name: 'exp_month', message: 'Expiry Month (MM):' },
//             { type: 'input', name: 'exp_year', message: 'Expiry Year (YYYY):' },
//             { type: 'input', name: 'cvc', message: 'CVC:' },
//         ]);

//         // Send upgrade request
//         const upgradeResponse = await apiClient.post('/billing/subscribe', {
//             plan_id: answers.plan_id,
//             card: {
//                 card_number: cardDetails.card_number,
//                 exp_month: cardDetails.exp_month,
//                 exp_year: cardDetails.exp_year,
//                 cvc: cardDetails.cvc,
//             },
//         });

//         console.log('Subscription updated successfully!');
//         console.log(`New Plan: ${upgradeResponse.data.plan.name}`);
//     } catch (error) {
//         console.error('Failed to upgrade plan:', error.response?.data?.message || error.message);
//     }
// };
const upgradePlan = async () => {
    try {
        // Fetch available plans
        const plansResponse = await apiClient.get('/billing/plans');
        const plans = plansResponse.data.plans.map((plan) => ({
            name: `${plan.name} ($${plan.price}/month)`,
            value: plan.id,
        }));

        // Let user select a plan
        const answers = await inquirer.prompt([
            { type: 'list', name: 'plan_id', message: 'Choose a plan to upgrade:', choices: plans },
        ]);

        // Request Checkout Session URL
        const sessionResponse = await apiClient.post('/billing/checkout-session', {
            plan_id: answers.plan_id,
        });

        console.log('Opening payment page...');
        await openUrl(sessionResponse.data.url);
    } catch (error) {
        console.error('Failed to upgrade plan:', error.response?.data?.message || error.message);
    }
};


module.exports = { billing, upgradePlan, addPaymentMethod, retryIncompletePayment};
