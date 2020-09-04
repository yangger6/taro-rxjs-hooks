import {useRef} from 'react'

export default function useConstant<T>(fn: () => T): T {
  const ref: any = useRef()
  if (!ref.current) {
    ref.current = {
      v: fn()
    }
  }
  return ref.current.v
}
