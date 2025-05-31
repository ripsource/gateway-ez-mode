# gateway-ez-mode

Some helpers on top of the Radix Babylon Gateway TypeScript SDK.

All devs in Radix, whether frontend or backend, surely have written helpers that make it easier to fetch data from the Radix Gateway. While Radix some great SDKs, sometimes you just want a very simple thing like get an account's balances. I would love it if we could collaborate as a community to share these helpers as a common repository of abstractions. Feel free to contribute!

## Warning: The APIs in this repository may not be stable and could be changed at any time.

# Installation

`npm install @rippy/gateway-ez-mode`

Find it on [NPM](https://www.npmjs.com/package/@rippy/gateway-ez-mode)

# Features

## Getting Account balances

```ts
const gateway = new GatewayEzMode();
const fungibleBalances =
    await gateway.getFungibleBalancesForComponent(SOME_RANDOM_ACCOUNT);
console.log(fungibleBalances);

/*
output:
[
    {
        token: {
            resourceAddress: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
            name: 'Radix',
            iconUrl: 'https://assets.radixdlt.com/icons/icon-xrd.png',
            symbol: 'XRD',
            description: "The Radix Public Network's native token, used to pay the network's required transaction fees and to secure the network through staking to its validator nodes."
        },
        balance: '22367268.028076063653370021'
    },
    ...
]
*/

const nftBalances =
    await gateway.getComponentNonFungibleBalances(SOME_RANDOM_ACCOUNT);
console.log(nftBalances);

/*
    {
      resourceInfo: {
        resourceAddress: 'resource_rdx1n2dd0w53zpdlqdz65vpymygj8a60vqnggyuxfpfdldjmy2224x020q',
        name: 'Domain',
        description: 'NFT that represents the domain name you own.',
        symbol: null,
        iconUrl: 'https://rns.foundation/assets/icons/domain-component.png',
        infoUrl: null,
        tags: [ 'domain', 'Radix Name Service' ]
      },
      nftBalance: [
        {
          id: '[43564ecf740b11ea807aa013fa0b5230]',
          keyImageUrl: 'https://qr.rns.foundation/pegging.xrd',
          name: 'pegging.xrd',
          description: null
        }
      ]
    },
    ...
*/
```

## Streaming through transactions

```ts
const gateway = new GatewayEzMode();
const stream = await gateway.getTransactionStream({
    startStateVersion: FROM_STATE_VERSION,
    batchSize: 100,
});
let transactions = await stream.next();
let moreTransactions = await stream.next();
```

## Easily parsing Programmatic JSON

This package exposes [`sbor-ez-mode`](https://www.npmjs.com/package/@calamari-radix/sbor-ez-mode) which is a library for defining schemas for Scrypto SBOR Programmatic JSON and parsing them into nice JavaScript objects. No more tedious parsing of Scrypto SBOR JSON!

```ts
// s (for sbor) is the main object you'll have to import to create schemas and parse
import { s } from '@rippy/gateway-ez-mode';

const swapEventSchema = s.struct({
    input_address: s.address(),
    input_amount: s.decimal(),
    output_address: s.address(),
    output_amount: s.decimal(),
    is_success: s.bool(),
});
```

For more information and examples, see [`sbor-ez-mode`](https://www.npmjs.com/package/@calamari-radix/sbor-ez-mode).
