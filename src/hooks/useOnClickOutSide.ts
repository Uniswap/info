import { useEffect, RefObject } from 'react'

export function useOnClickOutside(ref: RefObject<any>, handler?: () => void) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref || ref.current?.contains(event.target) || !handler) {
        return
      }
      handler()
    }
    document.addEventListener('click', listener)
    return () => {
      document.removeEventListener('click', listener)
    }
  }, [ref, handler])
}
