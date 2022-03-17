const etherscanKey = '6ZEJRJXFY8NFS8PT9UTKCDZRJ3ZPZJ51KT'
const genesisTimestamp = 1479642530

export async function getBlockFromTimestamp(unixTimestamp) {
  const etherscanBlockApi = `https://api-ropsten.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${unixTimestamp}&closest=before&apikey=${etherscanKey}`
  const response = await fetch(etherscanBlockApi)
  const data = await response.json()
  return data.result
}

export async function getBlocksFromTimestamps(timestamps, skipCount = 500) {
  if (timestamps?.length === 0) {
    return []
  }

  const now = Math.round(Date.now() / 1000)
  const currentBlock = await getBlockFromTimestamp(now)

  const arrayBlock = timestamps.map(t => {
    const block = Math.round(((t - genesisTimestamp) / (now - genesisTimestamp)) * currentBlock)
    return {
      timestamp: t,
      number: block,
    }
  })

  return arrayBlock
}
