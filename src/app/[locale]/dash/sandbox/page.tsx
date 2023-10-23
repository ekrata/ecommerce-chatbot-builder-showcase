import { toast, ToastContainer } from 'react-toastify';

export default function Page() {
  return (
    <>
      <iframe src={process.env?.["NEXT_PUBLIC_APP_WIDGET_URL"]} className='w-screen h-screen'>
        {/* <p>Your browser does not support iframes.</p> */}
      </iframe>
      <ul className="mt-5 space-y-3">
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
      </ul>
      <ul className="mt-5 space-y-3">
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
      </ul>
      <ul className="mt-5 space-y-3">
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
      </ul>
      <ul className="mt-5 space-y-3">
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
        <li className="w-full h-4 bg-gray-200 rounded-md dark:bg-gray-700"></li>
      </ul>


    </>
  )
}
