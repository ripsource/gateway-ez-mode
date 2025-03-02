import { GatewayApiClient } from '@radixdlt/babylon-gateway-api-sdk';
import { FungibleResourceBalance, NftBalance } from './types';
import { getFungibleBalancesForAccount } from './fungibleAccountBalances';
import { getNonFungibleBalancesForAccount } from './nftBalances';

export class Account {
    private gateway: GatewayApiClient;
    address: string;

    constructor(
        address: string,
        gateway: GatewayApiClient = GatewayApiClient.initialize({
            applicationName: '',
            networkId: 1,
        })
    ) {
        this.gateway = gateway;
        this.address = address;
    }

    getFungibleBalances(): Promise<FungibleResourceBalance[]> {
        return getFungibleBalancesForAccount(this.gateway, this.address);
    }

    getNftBalances(): Promise<NftBalance[]> {
        return getNonFungibleBalancesForAccount(this.gateway, this.address);
    }
}
