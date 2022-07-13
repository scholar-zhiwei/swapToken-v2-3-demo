import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { IMP } from '../typechain/contracts'

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
  const nftName = 'IMP'
  const nftSymbol = 'IMP'
  const baseUri = ''

  // 白名单 Mint 时间, 0 跳过设置
  const wlSaleStartTimeStamp = 0
  const wlSaleEndTimeStamp = 0

  // 公开免费 Mint 时间, 0 跳过设置
  const freeSaleStartTimeStamp = 0
  const freeSaleEndTimeStamp = 0

  // Cashier Mint 时间, 0 跳过设置
  const cashierSaleStartTimeStamp = 0
  const cashierSaleEndTimeStamp = 0

  // Vip Service Mint 时间, 0 跳过设置
  const vipServiceSaleStartTimeStamp = 0

  const { address } = await deploy('IMP', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [nftName, nftSymbol],
  })

  console.log('IMP deployed at ', address)

  const imp = (await ethers.getContract('IMP', deployer)) as IMP
  // Set BaseUri
  const currentUri = await imp.baseURI()
  if (!currentUri && baseUri) {
    console.log('Set Base URI...')
    await (await imp.setBaseURI(baseUri)).wait()
    console.log('New base URI successfully to:', await imp.baseURI())
  }

  // Set Mint Timestamp
  const currentWlStartTimeStamp = await imp.wlSaleStartTime()
  const currentWlEndTimeStamp = await imp.wlSaleEndTime()
  if (
    (currentWlStartTimeStamp.isZero() || currentWlEndTimeStamp.isZero()) &&
    wlSaleStartTimeStamp > 0 &&
    wlSaleEndTimeStamp > wlSaleStartTimeStamp
  ) {
    console.log('Set WL Sale Time...')
    await (await imp.setWlSaleTime(wlSaleStartTimeStamp, wlSaleEndTimeStamp)).wait()
    console.log('Set Start Time successfully to:', (await imp.wlSaleStartTime()).toString())
    console.log('Set End Time successfully to:', (await imp.wlSaleEndTime()).toString())
  }

  const currentFreeSaleStartTime = await imp.freeSaleStartTime()
  const currentFreeSaleEndTime = await imp.freeSaleEndTime()
  if (
    (currentFreeSaleStartTime.isZero() || currentFreeSaleEndTime.isZero()) &&
    freeSaleStartTimeStamp > 0 &&
    freeSaleEndTimeStamp > freeSaleStartTimeStamp
  ) {
    console.log('Set Free Sale Time...')
    await (await imp.setFreeSaleTime(freeSaleStartTimeStamp, freeSaleEndTimeStamp)).wait()
    console.log('Set Start Time successfully to:', (await imp.freeSaleStartTime()).toString())
    console.log('Set End Time successfully to:', (await imp.freeSaleEndTime()).toString())
  }

  const currentCashierSaleStartTime = await imp.cashierSaleStartTime()
  const currentCashierSaleEndTime = await imp.cashierSaleEndTime()
  if (
    (currentCashierSaleStartTime.isZero() || currentCashierSaleEndTime.isZero()) &&
    cashierSaleStartTimeStamp > 0 &&
    cashierSaleEndTimeStamp > cashierSaleStartTimeStamp
  ) {
    console.log('Set Cashier Sale Time...')
    await (await imp.setCashierSaleTime(cashierSaleStartTimeStamp, cashierSaleEndTimeStamp)).wait()
    console.log('Set Start Time successfully to:', (await imp.cashierSaleStartTime()).toString())
    console.log('Set End Time successfully to:', (await imp.cashierSaleEndTime()).toString())
  }

  const currentVipServiceSaleStartTime = await imp.vipServiceSaleStartTime()
  if (currentVipServiceSaleStartTime.isZero() && vipServiceSaleStartTimeStamp > 0) {
    console.log('Set Vip Service Sale Time...')
    await (await imp.setVipServiceSaleTime(vipServiceSaleStartTimeStamp)).wait()
    console.log('Set Start Time successfully to:', (await imp.vipServiceSaleStartTime()).toString())
  }
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['IMP']
