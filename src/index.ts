import { GatewayApiClient } from '@radixdlt/babylon-gateway-api-sdk';
import { Account } from './account';

// Please add methods to this class to extend the functionality
export class GatewayEzMode {
    gateway: GatewayApiClient;
    constructor(gateway?: GatewayApiClient) {
        if (gateway) {
            this.gateway = gateway;
        } else {
            this.gateway = GatewayApiClient.initialize({
                applicationName: '',
                networkId: 1,
            });
        }
    }

    getAccount(address: string): Account {
        return new Account(address, this.gateway);
    }
}
