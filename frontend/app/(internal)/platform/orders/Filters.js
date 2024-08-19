import { Fragment, useState, useEffect } from 'react'
import { Disclosure } from '@headlessui/react'
import { FunnelIcon } from '@heroicons/react/20/solid'
import { useSearchParams } from 'next/navigation'
import { OrderStatus } from '@/constants';

const getDefaultFilters = ({ key, options, searchParams = null }) => {
  const params = (searchParams && searchParams.get(key)) || null;
  if (!params) return {};

  const values = params
    .split(',')
    .map(value => options.find(option => option.queryParam === value))
    .filter(item => !!item);

  return Object.fromEntries(
    values.map(option => [option.value, option])
  );
}

const Filters = ({ onChange }) => {
  const searchParams = useSearchParams();
  const statuses = Object.values(OrderStatus).map(status => ({
    name: status,
    value: status,
    queryParam: status,
  }))
  const paymentMethods = [
    {
      name: 'Card',
      value: 'card',
      queryParam: 'card',
    },
    {
      name: 'Tiền mặt',
      value: 'cash',
      queryParam: 'cash',
    },
  ]
  const [filters, setFilters] = useState({
    statuses: getDefaultFilters({ key: 'statuses', searchParams, options: statuses }),
    fromDate: searchParams.get('fromDate') || '',
    toDate: searchParams.get('toDate') || '',
    paymentMethods: getDefaultFilters({ key: 'paymentMethods', searchParams, options: paymentMethods }),
  });

  useEffect(() => {
    onChange(filters);
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      statuses: getDefaultFilters({ key: 'statuses', options: statuses }),
      fromDate: '',
      toDate: '',
      paymentMethods: getDefaultFilters({ key: 'paymentMethods', options: paymentMethods }),
    })
    onChange({});
  }

  const onChangeFilters = (filterKey, option) => {
    // If key already exists, remove it
    // Otherwise, add the key-value
    if (option.value in filters[filterKey]) {
      setFilters(prev => {
        const copyprev = {...prev};
        delete copyprev[filterKey][option.value];
        return copyprev;
      });
      return;
    }

    setFilters(prev => ({
      ...prev,
      [filterKey]: {
        ...prev[filterKey],
        [option.value]: option,
      }
    }));
  };

  const onChangeDateFilter = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const numFilters = Object.values(filters).reduce(function(total, filterVal) {
      return total += Object.keys(filterVal).length;
  }, 0);

  return (
    <>
      <Disclosure
        as="section"
        aria-labelledby="filter-heading"
        className="grid items-center border-b border-t border-gray-200"
      >
        <h2 id="filter-heading" className="sr-only">
          Filters
        </h2>
        <div className="relative col-start-1 row-start-1 py-4">
          <div className="mx-auto flex max-w-7xl space-x-6 divide-x divide-gray-200 px-4 text-sm sm:px-6 lg:px-8">
            <div>
              <Disclosure.Button className="group flex items-center font-medium text-gray-700">
                <FunnelIcon
                  className="mr-2 h-5 w-5 flex-none text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                {numFilters} Bộ lọc
              </Disclosure.Button>
            </div>
            <div className="pl-6">
              <button
                type="button"
                className="text-gray-500"
                onClick={clearFilters}
              >
                Xoá bộ lọc
              </button>
            </div>
          </div>
        </div>
        <Disclosure.Panel className="border-t border-gray-200 py-10">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-4 px-4 text-sm sm:px-6 md:gap-x-6 lg:px-8">
            <div className="grid auto-rows-min grid-cols-2 gap-y-6">
              <fieldset>
                <legend className="block font-medium">Ngày tạo đơn</legend>
                <div className="isolate -space-y-px rounded-md shadow-sm max-w-xs pt-6 sm:pt-4">
                  <div className="relative rounded-md rounded-b-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                    <label htmlFor="name" className="block text-xs font-medium text-gray-900">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      name="name"
                      id="name"
                      className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      // placeholder="Jane Smith"
                      value={filters.fromDate}
                      onChange={evt => onChangeDateFilter('fromDate', evt.target.value)}
                    />
                  </div>
                  <div className="relative rounded-md rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                    <label htmlFor="job-title" className="block text-xs font-medium text-gray-900">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      name="job-title"
                      id="job-title"
                      className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      // placeholder="Head of Tomfoolery"
                      value={filters.toDate}
                      onChange={evt => onChangeDateFilter('toDate', evt.target.value)}
                    />
                  </div>
                </div>
              </fieldset>
              <fieldset>
                <legend className="block font-medium">Trạng thái</legend>
                <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                  {statuses.map((option, optionIdx) => (
                    <div key={`category-${option.value}`} className="flex items-center text-base sm:text-sm">
                      <input
                        id={`category-${optionIdx}`}
                        type="checkbox"
                        name="category[]"
                        className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        value={option.name}
                        checked={option.value in filters.statuses}
                        onChange={() => onChangeFilters('statuses', option)}
                      />
                      <label htmlFor={`category-${optionIdx}`} className="ml-3 min-w-0 flex-1 text-gray-600">
                        {option.name}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="block font-medium">Phương thức thanh toán</legend>
                <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                  {paymentMethods.map((option, optionIdx) => (
                    <div key={option.value} className="flex items-center text-base sm:text-sm">
                      <input
                        id={`paymentMethod-${optionIdx}`}
                        name="paymentMethod[]"
                        defaultValue={option.value}
                        type="checkbox"
                        className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        value={option.name}
                        checked={option.value in filters.paymentMethods}
                        onChange={() => onChangeFilters('paymentMethods', option)}
                      />
                      <label htmlFor={`paymentMethod-${optionIdx}`} className="ml-3 min-w-0 flex-1 text-gray-600">
                        {option.name}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        </Disclosure.Panel>
        {/* <div className="col-start-1 row-start-1 py-4">
          <div className="mx-auto flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
            <Menu as="div" className="relative inline-block">
              <div className="flex">
                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sắp xếp
                  <ChevronDownIcon
                    className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <Menu.Item key={option.name}>
                        {({ active }) => (
                          <a
                            href={option.href}
                            className={classNames(
                              option.current ? 'font-medium text-gray-900' : 'text-gray-500',
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            {option.name}
                          </a>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div> */}
      </Disclosure>
    </>
  );
}

export default Filters;