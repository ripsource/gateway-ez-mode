# gateway-ez-mode

Some helpers for interfacing with the Radix network.

All devs in Radix, whether frontend or backend, surely have written helpers that make it easier to fetch data from the Radix Gateway. While Radix some great SDKs, sometimes you just want a very simple thing like get an account's balances. This repository is a collection of these helpers. Feel free to contribute!

## Warning: The APIs in this repository may not be stable and could be changed at any time.

## Packages

- `gateway-ez-mode`
    - [README.md](./packages/gateway-ez-mode/README.md)
    - [NPM](https://www.npmjs.com/package/@rippy/gateway-ez-mode)
    - Helpers for interfacing with the Radix Gateway. Fetch account balances, stream transactions, get resource info and more.
- `sbor-ez-mode`
    - [README.md](./packages/sbor-ez-mode/README.md)
    - [NPM](https://www.npmjs.com/package/@calamari-radix/sbor-ez-mode)
    - A schema definition and parsing library for parsing Scrypto SBOR JSON into JavaScript objects.

# How to contribute?

To prevent wasted time, it would be best to first create an issue describing your idea. If you don't care to wait for my response, it would also be fine to just create a pull request and I wil review it.

Please add some kind of tests for your helper to `index.test.ts` or any new `*.test.ts` file. Tests are automatically run inside of pull requests.

Before pushing, you can run the `precommit.sh` script to make sure the project is:

- linted
- formatted
- tested
