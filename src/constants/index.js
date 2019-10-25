export const timeframeOptions = [
  { value: '1week', label: '1 week' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
  { value: 'all', label: 'All time' }
]

export const getTimeFrame = current => {
  switch (current) {
    case 'all':
      return timeframeOptions[3]
    case '1week':
      return timeframeOptions[0]
    case '1month':
      return timeframeOptions[1]
    case '3months':
      return timeframeOptions[2]
    default:
      return timeframeOptions[3]
  }
}
