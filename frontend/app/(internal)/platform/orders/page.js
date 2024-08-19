'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import PaginatedListPage from '@/components/PaginatedListPage';
import { formatCurrency } from '@/app/utils';
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
    key: 'user',
    label: 'Khách hàng',
    type: 'text',
    displayConverter: (user) => user.name,
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
const PlatformOrdersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get('page') || 1;
  const statuses = searchParams.get('statuses');
  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';
  const paymentMethods = searchParams.get('paymentMethods');
  const filters = {
    page,
    ...(statuses ? { statuses } : {}),
    fromDate,
    toDate,
    paymentMethods,
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
    const newPageUrl = '/platform/orders?' + new URLSearchParams({
      page: 1,
      ...aggregatedFilters,
    });
    router.push(newPageUrl, {
      scroll: false,
      shallow: true,
    })
  }

  return (
    <PaginatedListPage
      apiUrl='/api/orders'
      params={{
        all: true,
        ...filters,
      }}
      pageTitle="Đơn hàng"
      smallPageTableName="Các đơn hàng"
      columns={columns}
      resource="users"
      isMutable={false}
    >
      <Filters onChange={onFilterChange} />
    </PaginatedListPage>
  );
}

export default PlatformOrdersPage;