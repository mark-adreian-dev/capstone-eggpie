import { Spinner } from "@/components/ui/spinner"

function LoadingSpinner() {
  return (
    <div className='w-full h-full flex justify-center items-center'>
      <Spinner className="w-20 h-20"/>
    </div>
  )
}

export default LoadingSpinner
