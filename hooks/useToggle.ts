import { useCallback, useState } from 'react'

export default function useToggle(initial = false) {
  const [state, setState] = useState<boolean>(initial)
  const on = useCallback(() => setState(true), [])
  const off = useCallback(() => setState(false), [])
  const toggle = useCallback(() => setState(s => !s), [])
  return { state, setState, on, off, toggle }
}
