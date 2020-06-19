import { useState, useEffect } from 'react'
import { useUserTransactions } from '../../../contexts/User'
import { calculateTotalSwappedUSD } from '../utils'

export function useUserTotalSwappedUSD(account) {
  const [totalSwapped, setTotalSwapped] = useState(0)
  let transactions = useUserTransactions(account)
  useEffect(() => {
    if (transactions) {
      let swappedUSD = calculateTotalSwappedUSD(transactions)
      setTotalSwapped(swappedUSD)
    }
  }, [transactions])
  return totalSwapped
}
