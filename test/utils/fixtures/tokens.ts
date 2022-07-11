/* eslint-disable camelcase */
import { JsonRpcSigner } from '@ethersproject/providers'
import { expect } from 'chai'
import { Wallet } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { TestERC20 } from '../../../typechain/contracts/Test/TestERC20'
import { deployContract } from '../contracts'
import { toBN, BigNumberish } from '../encoding'

export const fixtureERC20 = async (signer: JsonRpcSigner, decimals: Number) => {
  const testERC20: TestERC20 = await deployContract(
    'TestERC20',
    signer,
    'TestToken',
    'TST',
    parseUnits('100000000', 18),
    decimals,
  )

  const mintAndApproveERC20 = async (signer: Wallet, spender: string, tokenAmount: BigNumberish) => {
    const amount = toBN(tokenAmount)
    // Offerer mints ERC20
    await testERC20.mint(signer.address, amount)

    // Offerer approves marketplace contract to tokens
    await expect(testERC20.connect(signer).approve(spender, amount))
      .to.emit(testERC20, 'Approval')
      .withArgs(signer.address, spender, tokenAmount)
  }

  return {
    testERC20,
    mintAndApproveERC20,
  }
}
