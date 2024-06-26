import { BsArrowDown, BsArrowUp } from 'react-icons/bs';

export interface Props {
  stats: { name: string, stat: string, previousStat: string, change: string, changeType: 'increase' | 'decrease' | 'neutral' }[]
}



export const TriStatPanel: React.FC<Props> = ({ stats }) => {

  return (
    <div className='animate-fade-left'>
      <dl className="grid grid-cols-1 mt-5 overflow-hidden bg-white divide-y divide-gray-200 rounded-lg shadow md:grid-cols-3 md:divide-x md:divide-y-0">
        {stats?.map((item) => (
          <div key={item.name} className="px-4 py-5 sm:p-6">
            <dt className="text-base font-normal text-gray-900">{item.name}</dt>
            <dd className="flex items-baseline justify-between mt-1 md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                {item.stat}
                <span className="ml-2 text-sm font-medium text-gray-500">from {item.previousStat}</span>
              </div>
              <div
                className={`${item.changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0`}
              >
                {item.changeType === 'increase' ? (
                  <BsArrowUp
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500"
                    aria-hidden="true"
                  />
                ) : (
                  <BsArrowDown
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500"
                    aria-hidden="true"
                  />
                )}

                <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                {item.change}
              </div>
            </dd>
          </div>
        ))
        }
      </dl >
    </div >
  )
}
