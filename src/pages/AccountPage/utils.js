// sum over all transactions and
export function calculateTotalLiquidity(positions) {
  let totalUSD = 0
  if (positions) {
    Object.keys(positions).map(key => {
      let valueUSD =
        (parseFloat(positions[key]?.liquidityTokenBalance) / parseFloat(positions[key]?.pair?.totalSupply)) *
        positions[key]?.pair?.reserveUSD
      return (totalUSD = totalUSD + valueUSD)
    })
  }
  return totalUSD
}
