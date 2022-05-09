import { parsePercent } from 'utils'
import { PercentValue } from './styled'

interface IPercent {
  percent: number
}

const Percent = ({ percent }: IPercent) => {
  const { data, color } = parsePercent(percent)
  return <PercentValue color={color}>{data}</PercentValue>
}

export default Percent
