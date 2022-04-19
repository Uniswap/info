import { globalApi } from 'api'

export async function getSubgraphStatus() {
  try {
    const res = await globalApi.getHealthStatus()
    const syncedBlock = res.data.indexingStatusForCurrentVersion.chains[0].latestBlock.number
    const headBlock = res.data.indexingStatusForCurrentVersion.chains[0].chainHeadBlock.number
    return { syncedBlock, headBlock }
  } catch (e) {
    console.log(e)
    return
  }
}
