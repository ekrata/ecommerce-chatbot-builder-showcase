import { sub } from 'date-fns';
import { useState } from 'react';

import { TriStatPanel } from './(charts)/TriStatPanel';

type RelativeDateKey = 'Yesterday' | 'Today' | 'Last 7 days' | 'Last 30 days' | 'Last 90 days' | 'Last year' | 'All time'

export const AnalyticsView: React.FC = () => {
  const dateNow = Date.now()
  const relativeDateMap: Record<RelativeDateKey, Date> = {
    'Today': sub(dateNow, { days: 1 }),
    'Yesterday': sub(dateNow, { days: 2 }),
    'Last 7 days': sub(dateNow, { days: 7 }),
    'Last 30 days': sub(dateNow, { days: 30 }),
    'Last 90 days': sub(dateNow, { days: 90 }),
    'Last year': sub(dateNow, { years: 1 }),
    'All time': sub(dateNow, { days: 90 }),
  }

  const [fromDate, setFromDate] = useState<RelativeDateKey>('Today')

  const stats = [
    { name: 'Total Conversations Count', stat: '71,897', previousStat: '70,946', change: '12%', changeType: 'increase' },
    { name: 'Average time till conversation assigned', stat: '58.16%', previousStat: '56.14%', change: '2.02%', changeType: 'increase' },
    { name: 'Average time it takes for a conversation to be solved', stat: '24.57%', previousStat: '28.62%', change: '4.05%', changeType: 'decrease' },
  ]

  return (
    <div className="flex flex-col">
      <div className="flex items-end justify-between w-full pt-5">
        <button
          id="dropdownDefaultButton"
          data-dropdown-toggle="lastDaysdropdown"
          data-dropdown-placement="bottom"
          className="inline-flex items-center text-sm font-medium text-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          type="button">
          {fromDate}
          <svg className="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
          </svg>
        </button>
        <div id="lastDaysdropdown" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
            {Object.entries(relativeDateMap)?.map(([key, relativeDate]) => (
              <li>
                <a onClick={() => setFromDate(key as RelativeDateKey)} href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{key}</a>
              </li>)
            )}
          </ul>
        </div>
        <TriStatPanel stats={stats} />

        {/* <a
          href="#"
          className="inline-flex items-center px-3 py-2 text-sm font-semibold text-blue-600 uppercase rounded-lg hover:text-blue-700 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
          Users Report
          <svg className="w-2.5 h-2.5 ms-1.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
          </svg>
        </a> */}
      </div>


    </div>
  )


}