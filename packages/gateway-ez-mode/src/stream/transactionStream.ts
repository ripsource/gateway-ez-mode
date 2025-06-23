import { StateVersionManager } from './stateVersionManager';
import {
    CommittedTransactionInfo,
    GatewayApiClient,
} from '@radixdlt/babylon-gateway-api-sdk';
import { defaultGatewayClient } from '../gatewayClient';
import { GatewayError } from '../error';

// export type TransactionStreamInput = Partial<{
//     gateway: GatewayApiClient;
//     startStateVersion: number;
//     batchSize: number;
// }>;

export interface TransactionStreamInput {
    gateway: GatewayApiClient;
    startStateVersion: number;
    batchSize: number;
    affected_entities?: string[];
    opt_ins?: {
        detailed_events: boolean;
        manifest_instructions: boolean;
        affected_global_entities: boolean;
        balance_changes: boolean;
    };
    stateVersionManager: StateVersionManager;
}

export interface TransactionStreamOutput {
    lastSeenStateVersion: number;
    transactions: CommittedTransactionInfo[];
}

/**
 * A stream of transactions from the Radix network. Allows you to
 * eaily fetch transactions in chronological order as they are
 * committed to the ledger.
 */
export class TransactionStream {
    gateway: GatewayApiClient;
    startStateVersion: number;
    batchSize: number;
    affected_entities?: string[];
    opt_ins?: {
        detailed_events: boolean;
        manifest_instructions: boolean;
        affected_global_entities: boolean;
        balance_changes: boolean;
    };
    stateVersionManager: StateVersionManager;

    constructor({
        gateway,
        startStateVersion,
        batchSize,
        opt_ins,
        affected_entities,
        stateVersionManager,
    }: TransactionStreamInput) {
        this.gateway = gateway;
        this.startStateVersion = startStateVersion;
        this.batchSize = batchSize;
        this.opt_ins = opt_ins;
        this.affected_entities = affected_entities;
        this.stateVersionManager = stateVersionManager;
    }

    /**
     * Create a new TransactionStream instance.
     *
     * @throws {GatewayError} If an error occurs while fetching data from the Radix Gateway API
     */
    static async create(
        input: Partial<TransactionStreamInput>
    ): Promise<TransactionStream> {
        if (input.batchSize && input.batchSize > 100) {
            console.warn(
                'Please note that the public Radix Gateway API has a limit of 100 transactions per page'
            );
        }
        const gateway = input.gateway || defaultGatewayClient();

        const stateVersionManager = new StateVersionManager({
            gatewayApi: gateway,
            startStateVersion: input.startStateVersion,
        });

        let stateVersion;
        try {
            stateVersion = await stateVersionManager.getStateVersion();
        } catch (error: any) {
            if (error instanceof GatewayError) {
                throw error;
            } else {
                throw new GatewayError(error);
            }
        }
        return new TransactionStream({
            gateway,
            startStateVersion: input.startStateVersion || stateVersion,
            batchSize: input.batchSize || 100,
            opt_ins: input.opt_ins,
            stateVersionManager,
        });
    }

    /**
     * Get the last seen state version. This is the state version of the last
     * transaction that was fetched from the stream.
     * @returns The last seen state version.
     * @throws {GatewayError} If an error occurs while fetching data from the Radix Gateway API
     */
    async lastSeenStateVersion(): Promise<number> {
        return this.stateVersionManager.getStateVersion();
    }

    /**
     * Fetch the next batch of transactions from the stream.
     * @returns A promise that resolves with the next batch of transactions
     * from the stream. Once the stream is caught up with ledger, it may return an empty array
     * @throws {GatewayError} If an error occurs while fetching data from the Radix Gateway API
     */
    async next(): Promise<TransactionStreamOutput> {
        let stateVersion;
        try {
            stateVersion = await this.stateVersionManager.getStateVersion();
        } catch (error: any) {
            if (error instanceof GatewayError) {
                throw error;
            } else {
                throw new GatewayError(error);
            }
        }
        let transactions;
        try {
            transactions =
                await this.gateway.stream.innerClient.streamTransactions({
                    streamTransactionsRequest: {
                        from_ledger_state: {
                            state_version: stateVersion,
                        },
                        affected_global_entities_filter: this.affected_entities,
                        order: 'Asc',
                        kind_filter: 'User',
                        opt_ins: this.opt_ins || {
                            detailed_events: false,
                            manifest_instructions: false,
                            affected_global_entities: false,
                            balance_changes: false,
                        },
                        limit_per_page: this.batchSize,
                        transaction_status_filter: 'Success',
                    },
                });
        } catch (error: any) {
            throw new GatewayError(error);
        }
        this.stateVersionManager.setStateVersion(
            transactions.items.at(-1)?.state_version || stateVersion
        );
        return {
            transactions: transactions.items.filter(
                (item) => item.state_version > stateVersion
            ),
            lastSeenStateVersion: stateVersion,
        };
    }
}
