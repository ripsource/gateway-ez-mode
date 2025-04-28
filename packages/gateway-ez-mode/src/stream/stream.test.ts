import { describe, it } from 'vitest';
import { Duration } from 'luxon';
import { GatewayEzMode } from '..';

describe(
    'stream',
    () => {
        it('should be able to fetch some transactions', async () => {
            const FROM_STATE_VERSION = 242174609;
            const TO_STATE_VERSION = 242189250;
            const gateway = new GatewayEzMode();

            const stream = await gateway.stream.getTransactionStream({
                startStateVersion: FROM_STATE_VERSION,
                batchSize: 100,
            });
            let transactions = await stream.next();
            while (transactions.lastSeenStateVersion < TO_STATE_VERSION) {
                transactions = await stream.next();
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        });

        it('should be able to fetch transactions with custom opt_ins', async () => {
            const FROM_STATE_VERSION = 242174609;
            const TO_STATE_VERSION = 242176000; // Using a smaller range for the test
            const gateway = new GatewayEzMode();

            const stream = await gateway.stream.getTransactionStream({
                startStateVersion: FROM_STATE_VERSION,
                batchSize: 100,
                opt_ins: {
                    detailed_events: true,
                    manifest_instructions: false,
                    affected_global_entities: true,
                    balance_changes: false,
                }
            });
            let transactions = await stream.next();
            while (transactions.lastSeenStateVersion < TO_STATE_VERSION) {
                transactions = await stream.next();
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        });
    },
    Duration.fromObject({ seconds: 10 }).toMillis()
);
