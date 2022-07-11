import { ContractReceipt } from '@ethersproject/contracts'

export function txInfo(tx: ContractReceipt) {
  console.log('Hash =>', tx.transactionHash)
  if (tx.events) {
    tx.events.forEach((event) => {
      console.log('Event Index =>', event.logIndex)
      console.log('Event Name =>', event.event)
      console.log('Args =>', event.args)
      console.log('Args String =>', event.args?.toString())
      console.log('------------------------------------------------------------------------------------------')
    })
  }
}
