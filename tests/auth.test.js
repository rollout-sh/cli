const chai = require('chai');
const sinon = require('sinon');
const apiClient = require('../src/utils/api');
const { saveToken, getToken } = require('../src/utils/config');
const login = require('../src/commands/login');

const { expect } = chai;

describe('CLI Login Command', () => {
    it('should save token on successful login', async () => {
        const stub = sinon.stub(apiClient, 'post').resolves({ data: { token: 'test-token' } });
        const saveStub = sinon.stub({ saveToken }).callsFake(() => {});

        await login();

        expect(stub.calledOnce).to.be.true;
        expect(saveStub.calledWith('test-token')).to.be.true;

        stub.restore();
    });

    it('should handle invalid login credentials', async () => {
        const stub = sinon.stub(apiClient, 'post').rejects({ response: { data: { message: 'Invalid credentials' } } });

        await login();

        expect(stub.calledOnce).to.be.true;

        stub.restore();
    });
});
