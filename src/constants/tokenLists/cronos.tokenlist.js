const VVS_TOKEN_LIST = []

const CRONOS_TOKEN_LIST = VVS_TOKEN_LIST.reduce((acc, cur) => {
  return {
    ...acc,
    [cur.address]: cur,
  }
}, {})

export default CRONOS_TOKEN_LIST
