
## Description

Uniswap-like dex protocol that allow a better incentivization for liquidity providers.
This repo includes a DDEX pool (rewards comes from the dex) and farming capabilities (rewards requires external income source).
![DefiestaDex diagram](https://github.com/DeFiesta/DefiestaDex/assets/24890377/6e430fdf-0a02-4d77-be7a-6ff34d1a182d)



## Getting Started

### Installation

Install dependencies:

`yarn install`

### Compile

`yarn compile`

To rebuild typechain specifically:

`yarn typechain`

### Run tests

```bash
yarn test                           # run tests without traces

yarn test --traceError              # prints calls for failed txs
yarn test --fulltraceError          # prints calls and storage ops for failed txs
yarn test --trace                   # prints calls for all txs
yarn test --fulltrace               # prints calls and storage ops for all txs

yarn test --v                       # same as --traceError
yarn test --vv                      # same as --fulltraceError
yarn test --vvv                     # same as --trace
yarn test --vvvv                    # same as --fulltrace

# specify opcode
yarn test --v --opcodes ADD,SUB     # shows any opcode specified for only failed txs
yarn test --vvv --opcodes ADD,SUB   # shows any opcode specified for all txs
```

### Deploy

#### Testnet (mumbai)

`yarn deploy_testnet`

#### Hardhat (test deploy script)

`yarn deploy`

### Prettier

Run linter (required before each commit):

`yarn prettier`

Check code is properly linted:

`yarn prettier:check`

### Slither

For quick and automatic syntaxic analysis, you can use Slither tool :
Slither is a Solidity static analysis framework. It runs a suite of vulnerability detectors, prints visual information about contract details. [...] Slither enables developers to find vulnerabilities, enhance their code comprehension, and quickly prototype custom analyses.

#### Install

See for options :
https://github.com/crytic/slither#how-to-install

#### Run

At project level (where package.json is):

```sh
slither . --json slither_output.json
#slither is called system wide, but an absolute or relative binary call can also be used
```

Better run with yarn to avoid errors & with config to choose printers_to_run :
`yarn slither`

## Licensing

The primary license for DefiestaDex is the Business Source License 1.1 (BUSL-1.1), see [LICENSE](LICENSE). However, smart-contract files imported from other projects do respect their original license (GPL-3, GPL-2, MIT, ...)

- All files under `periphery` are GPL-2
- All files under `core` except `core/libraries/DefiestaDexLibrary.sol` are GPL-2
- `contracts/rewards/FarmingRange.sol` is licensed under MIT, fork from Alpaca Finance
