import { useEffect } from 'react'

/** Closes a dropdown when clicking outside of `ref`, or on Escape */
export default function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined

    const onClick = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
      handler(event)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') handler(event)
    }

    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, handler, active])
}
