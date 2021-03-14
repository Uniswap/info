/**
 * Get health factor (F) of a pool
 */
export function getHealthFactor(pool) {
  return parseFloat(pool.reserve0) * parseFloat(pool.reserve1)
}
