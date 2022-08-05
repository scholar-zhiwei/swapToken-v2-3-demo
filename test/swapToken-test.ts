import { SnapshotRestorer, takeSnapshot } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { BigNumber} from 'ethers'
import { keccak256, solidityPack } from 'ethers/lib/utils'
import { ethers, network,getNamedAccounts} from 'hardhat'
import { SwapTokenv3 } from '../typechain/SwapTokenV3.sol/SwapTokenv3'

import { fixtureIMP } from './utils/fixtures/SwapTokenV3'

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
    let swapTokenv3: SwapTokenv3
    let tokenSnapshot: SnapshotRestorer
    before('', async function () {
      ;({ testSwapToken: swapTokenv3 } = await fixtureIMP(owner))
      tokenSnapshot = await takeSnapshot()
    })
    beforeEach(async () => {
      await tokenSnapshot.restore()
    })
    it('swapToken 1', async function () {
      const ethAmount = await swapTokenv3.getEstimatedETHforDAI(100)
      console.log(ethAmount)
      await swapTokenv3.connect(owner).convertEthToExactDai(100,{value:BigNumber.from(ethAmount)})
    })
  })
})
