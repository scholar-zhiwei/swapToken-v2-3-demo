import { SnapshotRestorer, takeSnapshot } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { keccak256, solidityPack, parseEther, parseUnits } from 'ethers/lib/utils'
import { ethers, network, getNamedAccounts } from 'hardhat'
import { SwapTokenV2 } from '../typechain/SwapTokenV2.sol'
import { fixtureIMP } from './utils/fixtures/IMP'
//import { IERC20 } from '../typechain/interfaces/IERC20'
describe('Test Sale', async function () {
  let owner: any
  before('', async function () {
    owner = (await ethers.getSigners())[0]
    console.log(owner.address)
  })
  describe('Test Sale', async function () {
    let ERC20ABI = require('@uniswap/v2-core/build/ERC20.json').abi

    let swapTokenV2: SwapTokenV2
    let tokenSnapshot: SnapshotRestorer
    const DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    const WETHAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    const MyAddress = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'
    const DAIHolder = '0x5d38b4e4783e34e2301a2a36c39a03c45798c4dd'
    const to = '0xbC1Cfe86Efad50f1F003623A18B755623cddc2Dd'

    before('', async function () {
      ;({ testSwapToken: swapTokenV2 } = await fixtureIMP(owner))
      tokenSnapshot = await takeSnapshot()
    })
    after(async () => {
      console.log('reset')
      await network.provider.request({
        method: 'hardhat_reset',
      })
    })
    beforeEach(async () => {
      await tokenSnapshot.restore()
    })

    it('should swap', async () => {
      const DAIContract = new ethers.Contract(DAIAddress, ERC20ABI, owner)
      const WETHContract = new ethers.Contract(WETHAddress, ERC20ABI, owner)
      //const WETHHolderBalance = await WETHContract.balanceOf(owner.address)
      console.log('myBalance = ', Number(await WETHContract.balanceOf(owner.address)))
      console.log('myBalance = ', Number(await owner.getBalance()))
      //   console.log('Initial WETH Balance:', ethers.utils.formatUnits(myBalance.toString()))
      const amount = ethers.utils.parseEther('10')
      //await WETHContract.approve(swapTokenV2.address, amount)

      // getting current timestamp
      const latestBlock = await ethers.provider.getBlockNumber()
      const timestamp = (await ethers.provider.getBlock(latestBlock)).timestamp
      console.log('strat')
      await swapTokenV2.connect(owner).swap(
        WETHAddress,
        DAIAddress,
        amount,
        to,
        timestamp + 1000, // adding 100 milliseconds to the current blocktime
        { value: parseUnits('10') },
      )
      const myBalance_updated = await WETHContract.balanceOf(to)
      console.log('Balance after Swap:', ethers.utils.formatUnits(myBalance_updated.toString()))
      console.log('daiBalance', Number(await DAIContract.balanceOf(to)))
      //expect(DAIHolderBalance_updated.eq(BigNumber.from(0))).to.be.true
      //   expect(myBalance_updated.gt(myBalance)).to.be.true
    })
  })
})
