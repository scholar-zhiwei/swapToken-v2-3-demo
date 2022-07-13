import { task } from 'hardhat/config'

task('set-base-uri', 'Set Base URI').setAction(async function (_, { ethers: { getContract }, getNamedAccounts }) {
  const { deployer } = await getNamedAccounts()
  console.log('Deployer:', deployer)

  const baseUri = 'ipfs://QmXRyAKyKRXMjJa6tD7eDe3YHH2V8Cegz5CzK6t9rrPN1d/'

  const imp = await getContract('IMP', deployer)

  const currentUri = await imp.baseURI()
  if (currentUri != baseUri) {
    console.log('Set Base URI...')
    await (await imp.setBaseURI(baseUri)).wait()
    console.log('Set successfully')
    console.log('New base URI:', await imp.baseURI())
  } else {
    console.log('Skip Same URI')
  }
})
