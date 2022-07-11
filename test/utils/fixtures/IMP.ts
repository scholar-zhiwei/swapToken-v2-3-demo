/* eslint-disable camelcase */
import { JsonRpcSigner } from '@ethersproject/providers'
import { IMP } from '../../../typechain/contracts/IMP'
import { deployContract } from '../contracts'

export const fixtureIMP = async (signer: JsonRpcSigner) => {
  const testIMP: IMP = await deployContract('IMP', signer, 'IMP', 'IMP')

  return {
    testIMP,
  }
}
