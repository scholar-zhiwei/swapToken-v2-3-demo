import { task } from 'hardhat/config'
import { IMP } from '../typechain/contracts'

task('withdraw', 'Withdraw ETH').setAction(async function (_, { ethers: { getContract }, getNamedAccounts }) {
  const { deployer } = await getNamedAccounts()
  console.log('Deployer:', deployer)

  const imp = await getContract('IMP', deployer) as IMP

  console.log('Withdraw ETH...')
  await (await imp.withdraw()).wait()
  console.log('successfully!')
})
