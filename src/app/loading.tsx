import { Loader2 } from 'lucide-react'
import React from 'react'

type Props = {}

const LoadingPage = (props: Props) => {
  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
    <Loader2 className='h-16 w-16 text-pink-600 animate-spin'/>
</div>
  )
}

export default LoadingPage