import 'dotenv/config'
import 'hardhat-spdx-license-identifier'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'

import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

const privateKey = process.env.PRIVATE_KEY
const mnemonic = 'test test test test test test test test test test test junk'
let accounts
if (privateKey) {
  accounts = [privateKey]
} else {
  accounts = {
    mnemonic,
  }
}

const namedAccounts = {
  deployer: {
    default: 0,
  },
  admin: {
    default: 0,
    kovan: 0,
  },
  dev: {
    default: 0,
  },
}

export type Signers = { [name in keyof typeof namedAccounts]: SignerWithAddress }

import './tasks'
import { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    sources: './contracts',
    // sources: "./flat",
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  namedAccounts,
  networks: {
    hecotest: {
      url: `https://http-testnet.hecochain.com`,
      accounts,
    },
    bsctest: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts,
    },
    bscmainnet: {
      url: `https://bsc-dataseed.binance.org/`,
      accounts,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
      accounts,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
      accounts,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
      accounts,
    },
    localhost: {
      url: `http://localhost:8545`,
    },
    truffle: {
      url: `http://localhost:24012/rpc`,
      timeout: 60 * 60 * 1000,
    },
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  etherscan: {
    apiKey: {
      kovan: process.env.ETH_SCAN_KEY ? process.env.ETH_SCAN_KEY : '',
      rinkeby: process.env.ETH_SCAN_KEY ? process.env.ETH_SCAN_KEY : '',
      ropsten: process.env.ETH_SCAN_KEY ? process.env.ETH_SCAN_KEY : '',
      bsc: process.env.BSC_SCAN_KEY ? process.env.BSC_SCAN_KEY : '',
      bscTestnet: process.env.BSC_SCAN_KEY ? process.env.BSC_SCAN_KEY : '',
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
}
export default config
