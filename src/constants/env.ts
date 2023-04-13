import invariant from 'tiny-invariant'

const required = (envKey: string): string => {
  const key = 'REACT_APP_' + envKey
  const envValue = process.env[key]
  invariant(envValue, `env ${key} is missing`)
  return envValue
}

export const AGGREGATOR_STATS_API = required('AGGREGATOR_STATS_API')
export const KS_SETTING_API = required('KS_SETTING_API')
export const PRICE_API = required('PRICE_API')
export const BLOCK_SERVICE_API = required('BLOCK_SERVICE_API')
