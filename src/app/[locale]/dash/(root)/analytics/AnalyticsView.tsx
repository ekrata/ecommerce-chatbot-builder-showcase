import { sub } from 'date-fns';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { BsChevronDown } from 'react-icons/bs';

import { relativeDiff } from '@/src/helpers';

import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { useAnalyticsQuery } from '../../../(hooks)/queries/useAnalyticsQuery';
import { useOrgQuery } from '../../../(hooks)/queries/useOrgQuery';
import { TriStatPanel } from './(charts)/TriStatPanel';

export type RelativeDateKey = 'Yesterday' | 'Today' | 'Last 7 days' | 'Last 30 days' | 'Last 90 days' | 'Last year' | 'All time'

export const AnalyticsView: React.FC = () => {
  const t = useTranslations('dash.analytics');
  const format = useFormatter();
  const [sessionOperator] = useAuthContext()
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

  const analyticsQuery = useAnalyticsQuery([sessionOperator?.orgId ?? '', relativeDateMap[fromDate].getTime(), dateNow, fromDate])

  window.addEventListener("load", function () {
    let options = {
      chart: {
        height: "100%",
        maxWidth: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 6,
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: 0
        },
      },
      series: [
        {
          name: "New users",
          data: [6500, 6418, 6456, 6526, 6356, 6456],
          color: "#1A56DB",
        },
      ],
      xaxis: {
        categories: ['01 February', '02 February', '03 February', '04 February', '05 February', '06 February', '07 February'],
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
    }

    if (document.getElementById("area-chart") && typeof ApexCharts !== 'undefined') {
      const chart = new ApexCharts(document.getElementById("area-chart"), options);
      chart.render();
    }
  });


  const prevConversationCount = analyticsQuery.data?.previous.reduce((prev, curr) => prev + (curr?.conversations?.totalCount ?? 0), 0) ?? 0
  const conversationCount = analyticsQuery.data?.current.reduce((prev, curr) => prev + (curr?.conversations?.totalCount ?? 0), 0) ?? 0
  const relativeConversationCountDiff = relativeDiff(prevConversationCount, conversationCount)
  let conversationDirection: 'increase' | 'decrease' | 'neutral' = 'neutral'
  const conversationSign = Math.sign(relativeConversationCountDiff)
  if (conversationSign === 1) {
    conversationDirection = 'increase'
  }
  if (conversationSign === -1) {
    conversationDirection = 'decrease'
  }




  const stats = [
    { name: 'Conversations', stat: new Intl.NumberFormat().format(conversationCount ?? 0), previousStat: new Intl.NumberFormat().format(prevConversationCount ?? 0), change: `${relativeConversationCountDiff.toFixed(2)}%`, changeType: 'decrease' },
    { name: 'Average wait time', stat: '58.16%', previousStat: '56.14%', change: '2.02%', changeType: 'increase' },
    { name: 'Average resolution time', stat: '24.57%', previousStat: '28.62%', change: '4.05%', changeType: 'decrease' },
  ]

  return (
    <div className="flex flex-col w-screen h-screen max-h-screen pl-10 pr-20 bg-white max-w-screen">
      <div className="flex justify-end w-full pt-5 mx-auto">
        <details className="dropdown dropdown-bottom dropdown-end">
          <summary className="m-1 font-normal normal-case gap-x-2 btn btn-ghost">{fromDate} <BsChevronDown /></summary>
          <ul className="p-2 text-sm shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-48">
            {Object.entries(relativeDateMap)?.map(([key, relativeDate]) => (
              <li>
                <a onClick={() => setFromDate(key as RelativeDateKey)} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{key}</a>
              </li>)
            )}
          </ul>
        </details>
        <div id="lastDaysdropdown" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">

          </ul>
        </div>
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
  )


}