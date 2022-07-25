/* eslint-disable camelcase */
import { JsonRpcSigner } from '@ethersproject/providers'
import { SwapToken } from '../../../typechain/SwapToken'
import { deployContract } from '../contracts'

export const fixtureIMP = async (signer: JsonRpcSigner) => {
  const testSwapToken: SwapToken = await deployContract('SwapToken', signer)

  return {
    testSwapToken,
  }
}
