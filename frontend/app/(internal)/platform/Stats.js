import useSWR from 'swr'
import classNames from 'classnames';
import { formatCurrency } from '@/app/utils';

const LoadingStats = () => {
  const arr = [1, 2, 3];
  return (
    <div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
      <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:px-2 xl:px-0">
        {arr.map((num) => (
          <div key={`loader-idx-${num}`} className="animate-pulse flex space-x-4 px-4 py-10 sm:px-6 xl:px-8">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-700 rounded w-24"></div>
              <div className="space-y-3">
                {/* <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-700 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-700 rounded col-span-1"></div>
                </div> */}
                <div className="h-8 bg-slate-700 rounded w-48"></div>
              </div>
            </div>
          </div>  
        ))}
      </dl>
    </div>
  )
}

const getFromUrl = async ({ url, params }) => {
  const res = await fetch(url + '?' + new URLSearchParams(params));
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    // throw new Error('Failed to fetch data')
  }
 
  return res.json();
}
const Stats = ({ filters }) => {
  // const { data: revenues, isLoading, mutate } = useSWR(, getFromUrl);
  const { data: revenues, isLoading } = useSWR({
    url: `/api/revenues`,
    params: {
      ...filters,
    },
  }, getFromUrl);
  if (isLoading) return <LoadingStats />;
  

  const stats = [
    { name: 'Revenue', value: '$405,091.00', change: '+4.75%', changeType: 'positive' },
    { name: 'Overdue invoices', value: '$12,787.00', change: '+54.02%', changeType: 'negative' },
    { name: 'Outstanding invoices', value: '$245,988.00', change: '-1.39%', changeType: 'positive' },
    // { name: 'Expenses', value: '$30,156.00', change: '+10.18%', changeType: 'negative' },
  ]
  return (
    <div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
      <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:px-2 xl:px-0">
        
        {revenues.map((stat, statIdx) => (
          <div
            key={stat.name}
            className={classNames(
              statIdx % 2 === 1 ? 'sm:border-l' : statIdx === 2 ? 'lg:border-l' : '',
              'flex items-baseline flex-wrap justify-between gap-y-2 gap-x-4 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8'
            )}
          >
            <dt className="text-sm font-medium leading-6 text-gray-500">{stat.name}</dt>
            {/* <dd
              className={classNames(
                stat.changeType === 'negative' ? 'text-rose-600' : 'text-gray-700',
                'text-xs font-medium'
              )}
            >
              {stat.change}
            </dd> */}
            <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
              {formatCurrency(stat.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default Stats;