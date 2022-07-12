import { SnapshotRestorer, takeSnapshot } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { Wallet } from 'ethers'
import { keccak256, solidityPack } from 'ethers/lib/utils'
import { ethers, network } from 'hardhat'
import MerkleTree from 'merkletreejs'
import { IMP } from '../typechain/contracts/IMP'

import { randomHex } from './utils/encoding'
import { fixtureIMP } from './utils/fixtures/IMP'
import { faucet } from './utils/impersonate'

describe('Test IMP', async function () {
  let owner: any
  let whitelisted: Wallet[] = []
  let unWhitelisted: Wallet[] = []
  const { provider } = ethers
  after(async () => {
    await network.provider.request({
      method: 'hardhat_reset',
    })
  })
  before('', async function () {
    owner = new ethers.Wallet(randomHex(32), provider)
    whitelisted.push(new ethers.Wallet(randomHex(32), provider))
    whitelisted.push(new ethers.Wallet(randomHex(32), provider))
    unWhitelisted.push(new ethers.Wallet(randomHex(32), provider))

    faucet(owner.address, provider)
    await Promise.all(whitelisted.map((wallet) => faucet(wallet.address, provider)))
    await Promise.all(unWhitelisted.map((wallet) => faucet(wallet.address, provider)))
  })

  describe('Test Sale', function () {
    let imp: IMP
    let tokenSnapshot: SnapshotRestorer
    before('', async function () {
      ;({ testIMP: imp } = await fixtureIMP(owner))
      // Set BaseUri
      const baseUri = 'ipfs://QmXRyAKyKRXMjJa6tD7eDe3YHH2V8Cegz5CzK6t9rrPN1d/'
      const currentTimestamp = (await provider.getBlock('latest')).timestamp
      await imp.setSaleTime(currentTimestamp - 1, currentTimestamp + 60 * 60 * 2, 0)
      await imp.setSaleTime(currentTimestamp - 1, currentTimestamp + 60 * 60 * 2, 1)
      await imp.setSaleTime(currentTimestamp - 1, currentTimestamp + 60 * 60 * 24, 2)

      await imp.setBaseURI(baseUri)
      tokenSnapshot = await takeSnapshot()
    })
    beforeEach(async () => {
      await tokenSnapshot.restore()
    })
    it('preSaleBuy 1', async function () {
      const leafNodes = whitelisted.map((x) => keccak256(solidityPack(['address', 'uint256'], [x.address, '2'])))
      //   console.log('leaves', leafNodes)
      const tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
      const root = tree.getHexRoot()
      //   console.log('tree', tree.toString())
      //   console.log('merkleRoot', root.toString())

      //   console.log(tree.verify(proof, leaf, root))
      await imp.setMerkleRoot(root)
      //   console.log('whitelisted[0].address', whitelisted[0].address)
      const leaf = keccak256(solidityPack(['address', 'uint256'], [whitelisted[0].address, '2']))
      const proof = tree.getHexProof(leaf)
      //   console.log('proof', proof)
      const maxSupply = await imp.MAX_SUPPLY()
      await expect(imp.connect(whitelisted[0]).wlPreSaleBuy(proof, 2, 1)).emit(imp, 'Minted').withArgs(maxSupply.sub(1))
      expect(await imp.balanceOf(whitelisted[0].address)).to.be.equal(1)
      expect(await imp.totalSupply()).to.be.equal(1)
    })
    it('freeSaleBuy 1', async function () {
      const maxSupply = await imp.MAX_SUPPLY()
      await expect(imp.connect(owner).freeSaleBuy(1)).emit(imp, 'Minted').withArgs(maxSupply.sub(1))
      expect(await imp.balanceOf(owner.address)).to.be.equal(1)
      expect(await imp.totalSupply()).to.be.equal(1)
    })
    it('cashierSaleBuy 1', async function () {
      const maxSupply = await imp.MAX_SUPPLY()
      await expect(imp.connect(owner).cashierSaleBuy(2,{value:ethers.utils.parseEther("0.1")})).emit(imp, 'Minted').withArgs(maxSupply.sub(2))
      expect(await imp.balanceOf(owner.address)).to.be.equal(2)
      expect(await imp.totalSupply()).to.be.equal(2)
    })
    it('vipServiceSaleBuy 1', async function () {
      const maxSupply = await imp.MAX_SUPPLY()
      await expect(imp.connect(owner).vipServiceSaleBuy(10,{value:ethers.utils.parseEther("10")})).emit(imp, 'Minted').withArgs(maxSupply.sub(10))
      expect(await imp.balanceOf(owner.address)).to.be.equal(10)
      expect(await imp.totalSupply()).to.be.equal(10)
    })
  })
})
