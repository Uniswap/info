import { Text } from 'rebass'
import { parsePercent } from 'utils'

interface IPercent {
  percent: number
}

const Percent = ({ percent }: IPercent) => {
  const { data, color } = parsePercent(percent)
  return (
    <Text fontWeight={500} color={color}>
      {data}
    </Text>
  )
}

export default Percent
