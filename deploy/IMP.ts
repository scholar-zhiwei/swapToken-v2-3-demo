import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
}: HardhatRuntimeEnvironment) {
  console.log('Running IMP deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  console.log('Deployer:', deployer)

  // 初始化设置
  const nftName = 'Cyborg Civet'
  const nftSymbol = 'CC'
  const baseUri = 'ipfs://QmXRyAKyKRXMjJa6tD7eDe3YHH2V8Cegz5CzK6t9rrPN1d/'

  const { address } = await deploy('IMP', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [nftName, nftSymbol],
  })

  console.log('IMP deployed at ', address)

  const cyborgCivet = await ethers.getContract('IMP', deployer)
  // Set BaseUri
  const currentUri = await cyborgCivet.baseURI()
  if (!currentUri) {
    console.log('Set Base URI...')
    await (await cyborgCivet.setBaseURI(baseUri)).wait()
    console.log('New base URI successfully to:', await cyborgCivet.baseURI())
  }
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['IMP']
