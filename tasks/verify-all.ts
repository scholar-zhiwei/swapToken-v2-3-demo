import { task } from 'hardhat/config'
import { NomicLabsHardhatPluginError } from 'hardhat/plugins'

task('verify:all', 'Verify all contracts', async (_, { ethers, run }) => {
  const token = await ethers.getContract('IMP')
  const contracts: {
    name: string
    address: string
    constructorArguments?: string[]
  }[] = [
    {
      name: 'IMP',
      address: token.address,
      constructorArguments: ['IMP', 'IMP'],
    },
  ]

  for (const { address, constructorArguments } of contracts) {
    try {
      await run('verify:verify', {
        address,
        constructorArguments,
      })
    } catch (error) {
      if (error instanceof NomicLabsHardhatPluginError) {
        console.debug(error.message)
      }
    }
  }
})
