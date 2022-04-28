import { client } from 'service/client'
import { SUBGRAPH_HEALTH } from 'service/queries/global'

export async function getSubgraphStatus() {
  try {
    const res = await client.query({
      query: SUBGRAPH_HEALTH,
      context: {
        client: 'health'
      }
    })
    const syncedBlock = +res.data.indexingStatusForCurrentVersion.chains[0].latestBlock.number
    const headBlock = +res.data.indexingStatusForCurrentVersion.chains[0].chainHeadBlock.number
    return { syncedBlock, headBlock }
  } catch (e) {
    console.log(e)
    return
  }
}
