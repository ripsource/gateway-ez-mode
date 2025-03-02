import {
    GatewayApiClient,
    TransactionStatusResponse,
} from '@radixdlt/babylon-gateway-api-sdk';

export class TransactionPollingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TransactionPollingError';
    }
}

export class TransactionPollingAbortedError extends TransactionPollingError {
    constructor() {
        super('Transaction polling was aborted');
        this.name = 'TransactionPollingAbortedError';
    }
}

export class TransactionPollingTimeoutError extends TransactionPollingError {
    constructor() {
        super('Transaction polling timed out');
        this.name = 'TransactionPollingTimeoutError';
    }
}

/**
 * Options for polling transaction status
 * @property abortSignal - AbortSignal to cancel polling
 * @property baseDelay - Initial delay between polls in milliseconds (default: 1000)
 * @property maxRetries - Maximum number of polling attempts (default: 10)
 * @property maxDelay - Maximum delay between polls in milliseconds (default: 10000)
 * @property delayFn - Custom function to calculate delay between polls based on retry count
 * @property gatewayApiClient - Custom GatewayApiClient instance (default: new instance with networkId 1)
 */
export type PollTransactionStatusOptions = Partial<{
    abortSignal: AbortSignal;
    baseDelay: number;
    maxRetries: number;
    maxDelay: number;
    delayFn: (retry: number) => number;
    gatewayApiClient?: GatewayApiClient;
}>;

/**
 * Poll the status of a transaction until it is not pending.
 * @param transactionId - The ID of the transaction to poll.
 * @param options - Options for the polling.
 * @returns A promise that resolves to the transaction status.
 */
export const pollTransactionStatus = (
    transactionId: string,
    options?: PollTransactionStatusOptions
) => {
    const {
        abortSignal,
        baseDelay = 1000,
        maxRetries = 10,
        maxDelay = 10000,
        delayFn = (retry: number) =>
            Math.min(baseDelay * Math.pow(2, retry), maxDelay),
        gatewayApiClient = GatewayApiClient.initialize({
            applicationName: '',
            networkId: 1,
        }),
    } = options || {};

    // eslint-disable-next-line no-async-promise-executor
    return new Promise<TransactionStatusResponse>(async (resolve, reject) => {
        let response: TransactionStatusResponse | undefined;
        let retry = 0;

        if (abortSignal?.aborted) {
            reject(new TransactionPollingAbortedError());
            return;
        }

        abortSignal?.addEventListener(
            'abort',
            () => {
                reject(new TransactionPollingAbortedError());
            },
            { once: true }
        );

        while (!response && retry < maxRetries) {
            const result =
                await gatewayApiClient.transaction.getStatus(transactionId);

            if (result.intent_status !== 'Pending') {
                response = result;
                break;
            }

            const delay = delayFn(retry);
            retry = retry + 1;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }

        if (!response) {
            reject(new TransactionPollingTimeoutError());
            return;
        }

        resolve(response);
    });
};
