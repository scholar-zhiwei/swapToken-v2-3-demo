import { task } from 'hardhat/config'
import { IMP } from '../typechain'

task('set-white-list', 'Set White List Merkle Root')
  .addParam('root', 'White List Merkle Root')
  .setAction(async function ({ root }, { ethers: { getContract }, getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()
    console.log('Deployer:', deployer)

    const imp = (await getContract('IMP', deployer)) as IMP

    console.log('Set White List Merkle Root...')
    await (await imp.setMerkleRoot(root)).wait()
    console.log('Set successfully')
  })
