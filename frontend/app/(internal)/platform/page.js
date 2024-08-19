'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import PaginatedListPage from '@/components/PaginatedListPage';
import { formatCurrency } from '@/app/utils';
import Stats from './Stats';
import Filters from './Filters';

const columns = [
  {
    key: 'orderNumber',
    label: 'Mã đơn hàng',
    type: 'text',
    href: (order) => `/platform/orders/${order.orderNumber}`,
  },
  {
    key: 'status',
    label: 'Trạng thái',
    type: 'text',
  },
  {
    key: 'payments',
    label: 'Doanh thu',
    type: 'text',
    displayConverter: (payments) => formatCurrency(payments[0]?.amount || 0),
  },
  {
    key: 'address',
    label: 'Địa chỉ',
    type: 'text',
    displayConverter: (address) => address.streetAddress,
  },
  {
    key: 'createdAt',
    label: 'Ngày đặt hàng',
    type: 'text',
    displayConverter: (createdAt) => (new Date(createdAt)).toLocaleDateString(),
  },
];

export default function PlatformMainPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get('page') || 1;
  const statuses = searchParams.get('statuses');
  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';
  const filters = {
    page,
    ...(statuses ? { statuses } : {}),
    fromDate,
    toDate,
  }

  const onFilterChange = (_filters) => {
    const aggregatedFilters = {};
    for (const filterKey in _filters) {
      if (typeof _filters[filterKey] === 'string') {
        aggregatedFilters[filterKey] = _filters[filterKey];
      } else {
        aggregatedFilters[filterKey] = Object
          .values(_filters[filterKey])
          .map(val => val.queryParam)
          .join(',');
      }
    }
    const newPageUrl = '/platform?' + new URLSearchParams({
      page: 1,
      ...aggregatedFilters,
    });
    router.push(newPageUrl, {
      scroll: false,
      shallow: true,
    })
  }

  return (
    <>
      <main>
        <div className="relative isolate overflow-hidden">
          {/* Secondary navigation */}
          <header className="pb-4 pt-6 sm:pb-6">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-gray-900">
                Thống kê doanh thu
              </h1>
            </div>
          </header>

          <Filters onChange={onFilterChange} />

          {/* Stats */}
          <Stats filters={filters} />
          {/* <div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
            <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
              {stats.map((stat, statIdx) => (
                <div
                  key={stat.name}
                  className={classNames(
                    statIdx % 2 === 1 ? 'sm:border-l' : statIdx === 2 ? 'lg:border-l' : '',
                    'flex items-baseline flex-wrap justify-between gap-y-2 gap-x-4 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8'
                  )}
                >
                  <dt className="text-sm font-medium leading-6 text-gray-500">{stat.name}</dt>
                  <dd
                    className={classNames(
                      stat.changeType === 'negative' ? 'text-rose-600' : 'text-gray-700',
                      'text-xs font-medium'
                    )}
                  >
                    {stat.change}
                  </dd>
                  <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div> */}

          <div
            className="absolute left-0 top-full -z-10 mt-96 origin-top-left translate-y-40 -rotate-90 transform-gpu opacity-20 blur-3xl sm:left-1/2 sm:-ml-96 sm:-mt-10 sm:translate-y-0 sm:rotate-0 sm:transform-gpu sm:opacity-50"
            aria-hidden="true"
          >
            <div
              className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
              style={{
                clipPath:
                  'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
              }}
            />
          </div>
        </div>
        
        <div className="py-16">
          <PaginatedListPage
            apiUrl='/api/orders'
            params={{
              all: true,
              ...filters,
            }}
            pageTitle="Đơn hàng"
            smallPageTableName="Các đơn hàng"
            columns={columns}
            resource="orders"
            isMutable={false}
          />
        </div>
      </main>
    </>
  )
}
