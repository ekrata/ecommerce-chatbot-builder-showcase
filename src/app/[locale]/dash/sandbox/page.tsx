'use client'

import { useAuthContext } from '../../(hooks)/AuthProvider';

export default function Page() {
  const [sessionUser] = useAuthContext()
  if (typeof window !== 'undefined') {
    console.log(process.env.NEXT_PUBLIC_APP_API_URL)
    console.log(process.env.NEXT_PUBLIC_APP_WIDGET_URL)

    return (
      <div className='relative w-screen h-screen bg-white'>
        <iframe id='echat-chat-widget' src={`${process?.env?.["NEXT_PUBLIC_APP_WIDGET_URL"]}?orgId=${sessionUser?.orgId}`} className='absolute z-10 w-screen h-screen bg-transparent'>
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
