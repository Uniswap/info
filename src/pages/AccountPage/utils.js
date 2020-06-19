// sum over all transactions and
export function calculateTotalSwappedUSD(transactions) {
  let totalUSD = 0
  if (transactions && transactions.swaps) {
    transactions.swaps.map(swap => {
      return (totalUSD = totalUSD + parseFloat(swap.amountUSD))
    })
  }
  return totalUSD
}
