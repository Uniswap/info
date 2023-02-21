import { useNetworksInfo } from '../contexts/NetworkInfo'
import { useEffect, useState } from 'react'

export default function usePrices(addresses) {
  const [[networksInfo]] = useNetworksInfo()

  const [prices, setPrices] = useState([])

  const ids = addresses.map(item => item.toLowerCase()).join(',')
  useEffect(() => {
    const fetchPrices = async () => {
      const res = await fetch(`${process.env.REACT_APP_PRICE_API}/${networksInfo.priceRoute}/api/v1/prices`, {
        method: 'POST',
        body: JSON.stringify({
          ids,
        }),
      }).then(res => res.json())

      if (res?.data?.prices?.length) {
        const formattedPrices = ids.split(',').map(address => {
          const price = res.data.prices.find(p => p.address.toLowerCase() === address)
          return price?.marketPrice || price?.price || 0
        })

        setPrices(formattedPrices)
      }
    }

    if (ids) fetchPrices()
  }, [ids, networksInfo.priceRoute])

  return prices
}
