import { task } from 'hardhat/config'

task('set-base-uri', 'Set Base URI').setAction(async function (_, { ethers: { getContract }, getNamedAccounts }) {
  const { deployer } = await getNamedAccounts()
  console.log('Deployer:', deployer)

  const baseUri = 'ipfs://QmXRyAKyKRXMjJa6tD7eDe3YHH2V8Cegz5CzK6t9rrPN1d/'

  const cyborgCivet = (await getContract('CyborgCivet', deployer)) 

  const currentUri = await cyborgCivet.baseURI()
  if (currentUri != baseUri) {
    console.log('Set Base URI...')
    await (await cyborgCivet.setBaseURI(baseUri)).wait()
    console.log('Set successfully')
    console.log('New base URI:', await cyborgCivet.baseURI())
  } else {
    console.log('Skip Same URI')
  }
})
