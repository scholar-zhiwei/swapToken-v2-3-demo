/* eslint-disable camelcase */
import { JsonRpcSigner } from '@ethersproject/providers'
import { SwapTokenv3 } from '../../../typechain/SwapTokenV3.sol/SwapTokenv3'
import { deployContract } from '../contracts'

export const fixtureIMP = async (signer: JsonRpcSigner) => {
  const testSwapToken: SwapTokenv3 = await deployContract('SwapTokenV3', signer)

  return {
    testSwapToken,
  }
}
