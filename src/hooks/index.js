import { useState, useCallback, useEffect } from 'react'
import { darken, transparentize } from 'polished'
import Vibrant from 'node-vibrant'
import { hex } from 'wcag-contrast'
import { isAddress } from '../helpers'
import copy from 'copy-to-clipboard'

export function useColor(tokenAddress) {
  const [color, setColor] = useState('#2172E5')
  if (tokenAddress) {
    const path = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
      tokenAddress
    )}/logo.png`
    if (path) {
      Vibrant.from(path).getPalette((err, palette) => {
        if (palette && palette.Vibrant) {
          let detectedHex = palette.Vibrant.hex
          let AAscore = hex(detectedHex, '#FFF')
          // while (AAscore < 3) {
          //   detectedHex = darken(0.01, detectedHex)
          //   AAscore = hex(detectedHex, '#FFF')
          // }
          console.log(detectedHex)
          setColor(detectedHex)
        }
      })
    }
  }
  return color
}

export function useCopyClipboard(timeout = 500) {
  const [isCopied, setIsCopied] = useState(false)

  const staticCopy = useCallback(text => {
    const didCopy = copy(text)
    setIsCopied(didCopy)
  }, [])

  useEffect(() => {
    if (isCopied) {
      const hide = setTimeout(() => {
        setIsCopied(false)
      }, timeout)

      return () => {
        clearTimeout(hide)
      }
    }
  }, [isCopied, setIsCopied, timeout])

  return [isCopied, staticCopy]
}

export const useOutsideClick = (ref, ref2, callback) => {
  const handleClick = e => {
    if (ref.current && ref.current && !ref2.current) {
      callback(true)
    } else if (ref.current && !ref.current.contains(e.target) && ref2.current && !ref2.current.contains(e.target)) {
      callback(true)
    } else {
      callback(false)
    }
  }
  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  })
}
