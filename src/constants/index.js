import intl from 'react-intl-universal'

export const timeframeOptions = [
  { value: '1week', label: '1 week' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
  { value: 'all', label: 'All time' }
]

export const getTimeFrame = current => {
  const timeframeOptions = [
  { value: '1week', label: intl.get('oneweek') },
  { value: '1month', label: intl.get('onemonth') },
  { value: '3months', label: intl.get('threemonths') },
  { value: 'all', label: intl.get('alltime') }
  ]
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
