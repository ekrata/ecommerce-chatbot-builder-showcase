'use client'
import { toast, ToastContainer } from 'react-toastify';

export default function Page() {

  if (typeof window !== 'undefined') {
    console.log(process.env.NEXT_PUBLIC_APP_API_URL)
    console.log(process.env.NEXT_PUBLIC_APP_WIDGET_URL)
    return (
      <div className='relative w-screen h-screen bg-white'>
        <iframe id='echat-chat-widget' src={process?.env?.["NEXT_PUBLIC_APP_WIDGET_URL"]} className='absolute z-10 w-screen h-screen bg-transparent'>
          {/* <p>Your browser does not support iframes.</p> */}
        </iframe>
        <div className='absolute w-full h-screen mx-10 bg-white'>
          <button className='btn btn-ghost'></button>
          <div className='grid w-screen grid-cols-3'>
            {new Array(6).fill(null).map((item, i) => (
              <div className=''>
                {cardSkeleton}
              </div>
            ))}
          </div>
          {/* <ul className="fixed w-screen mx-10 mt-5 space-y-3">
            <li className="h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
            <li className="h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
            <li className="h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
            <li className="h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
          </ul>
          <ul className="mt-5 space-y-3">
            <li className="h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
            <li className="h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
            <li className="h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
            <li className="h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
          </ul> */}

        </div>
      </div>
    )
  }
  return null
}

export const cardSkeleton = (
  <div className="p-4 space-y-5 rounded-2xl bg-white/25">
    <div className="h-24 rounded-lg bg-gray-200/20"></div>
    <div className="space-y-3">
      <div className="w-3/5 h-3 rounded-lg bg-gray-400/10"></div>
      <div className="w-4/5 h-3 rounded-lg bg-gray-400/20"></div>
      <div className="w-2/5 h-3 rounded-lg bg-gray-400/20"></div>
    </div>
  </div>
)