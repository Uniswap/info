export const timeframeOptions = {
  WEEK: '1 week',
  MONTH: '1 month',
  // THREE_MONTHS: '3 months',
  // YEAR: '1 year',
  ALL_TIME: 'All time'
}

export const STATUS = {
  0: 'INVALID', // Uninitialized  swap -> can go to ACTIVE
  1: 'ACTIVE', // Active swap -> can go to WITHDRAWN or EXPIRED
  2: 'REFUNDED', // Swap is refunded -> final state.
  3: 'COMPLETED', // Swap is withdrawn -> final state.
  4: 'EXPIRED' // Swap is expired -> can go to REFUNDED
}
