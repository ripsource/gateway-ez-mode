import { GatewayEzMode } from '.';
import { Account } from './account';

const RATTA_RESOURCE =
    'resource_rdx1t5wuuwfg3uk2y5l88rya553t3v4zyepf7wjekphryw6yepedyf7pug';
const SOME_RANDOM_ACCOUNT =
    'account_rdx1cx26ckdep9t0lut3qaz3q8cj9wey3tdee0rdxhc5f0nce64lw5gt70';
const DELETED_RATTA_ACCOUNT =
    'account_rdx12xru8aww4w73rr7r3wrc9nk428jr93efxvwtazen7hs3u43cyl5ssv';

describe('gatewaySdk', () => {
    it('should initialize correctly', () => {
        new GatewayEzMode();
    });

    it('should be able to get the gateways status', async () => {
        const gateway = new GatewayEzMode();
        await gateway.gateway.status.getCurrent();
    });

    it('should not error when I ask for an accounts balances', async () => {
        const gateway = new GatewayEzMode();
        const account = gateway.getAccount(SOME_RANDOM_ACCOUNT);
        const balances = await account.getFungibleBalances();
        console.log(balances);
        expect(balances).toBeDefined();
    });

    // I put 1 RÅTTA in this account and then deleted access to it on-ledger so this test should always pass
    it('should see 1 ratta in this account', async () => {
        const gateway = new GatewayEzMode();
        const account = gateway.getAccount(DELETED_RATTA_ACCOUNT);
        const balances = await account.getFungibleBalances();
        expect(balances).toBeDefined();
        const rattaBalance = balances.find(
            (balance) => balance.resourceInfo.resourceAddress === RATTA_RESOURCE
        );
        if (!rattaBalance) {
            throw new Error('No ratta balance found');
        }
        expect(rattaBalance.balance).toBe('1');
        expect(rattaBalance.resourceInfo.resourceAddress).toBe(RATTA_RESOURCE);
    });

    // use the account class on its own with a regular gateway instance
    it('should be able to get the gateways status', async () => {
        const account = new Account(SOME_RANDOM_ACCOUNT);
        await account.getFungibleBalances();
    });

    // get nfts for an account
    it('should be able to get nft balances', async () => {
        const account = new Account(SOME_RANDOM_ACCOUNT);
        const balances = await account.getNftBalances();
        balances.forEach((balance) => {
            console.log(balance);
        });
    });
});
