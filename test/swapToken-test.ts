import { SnapshotRestorer, takeSnapshot } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { BigNumber} from 'ethers'
import { keccak256, solidityPack } from 'ethers/lib/utils'
import { ethers, network,getNamedAccounts} from 'hardhat'
import { SwapToken } from '../typechain/SwapToken'

import { fixtureIMP } from './utils/fixtures/IMP'

describe('Test IMP', async function () {
  let owner: any
  const { provider } = ethers
  after(async () => {
    await network.provider.request({
      method: 'hardhat_reset',
    })
  })
  before('', async function () {
    [owner] = await ethers.getSigners()
    // const [owners] = await ethers.getSigners();
    // console.log(owners);
  })

  describe('Test Sale', function () {
    let swapToken: SwapToken
    let tokenSnapshot: SnapshotRestorer
    before('', async function () {
      ;({ testSwapToken: swapToken } = await fixtureIMP(owner))
      tokenSnapshot = await takeSnapshot()
    })
    beforeEach(async () => {
      await tokenSnapshot.restore()
    })
    it('swapToken 1', async function () {
      const ethAmount = await swapToken.getEstimatedETHforDAI(100)
      console.log(ethAmount)
      await swapToken.connect(owner).convertEthToExactDai(100,{value:BigNumber.from(ethAmount)})
    })
  })
})
