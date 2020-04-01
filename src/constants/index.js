export const timeframeOptions = [
  { value: '1week', label: '1 week' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
  { value: '1year', label: '1 Year' },
  { value: 'all', label: 'All time' }
]

export const getTimeFrame = current => {
  switch (current) {
    case 'all':
      return timeframeOptions[4]
    case '1week':
      return timeframeOptions[0]
    case '1month':
      return timeframeOptions[1]
    case '3months':
      return timeframeOptions[2]
    case '1year':
      return timeframeOptions[3]
    default:
      return timeframeOptions[4]
  }
}

export const windowOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

export const getTimeWindow = current => {
  switch (current) {
    case 'daily':
      return windowOptions[0]
    case 'weekly':
      return windowOptions[1]
    case 'monthly':
      return windowOptions[2]
    default:
      return windowOptions[0]
  }
}
