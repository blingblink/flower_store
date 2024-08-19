'use client'

import { Fragment, useState, useEffect } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames';
import { useSearchParams } from 'next/navigation'
import useSWRImmutable from 'swr';
import { Categories } from '@/constants';
import { useDebounce } from '@/hooks/useDebounce';


const filterPrices = [
  { value: '0', label: '0 - 100,000 VND', queryParam: '0..100000' },
  { value: '100', label: '100,000 - 200,000 VND', queryParam: '100000..200000' },
  { value: '200', label: '200,000 - 500,000 VND', queryParam: '200000..500000' },
  { value: '500', label: '500,000+ VND', queryParam: '500000..' },
];
const sortOptions = [
  { name: 'Most Popular', href: '#', current: true },
  { name: 'Best Rating', href: '#', current: false },
  { name: 'Newest', href: '#', current: false },
  { name: 'Price: Low to High', href: '#', current: false },
  { name: 'Price: High to Low', href: '#', current: false },
]

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
  const queryParams = searchParams.get('query');
  const [query, setQuery] = useState(queryParams || '');

  const categories = Categories.map(category => ({
    ...category,
    name: category.name,
    value: category.name,
    queryParam: category.name,
  }));
  const [filters, setFilters] = useState({
    prices: getDefaultFilters({ key: 'prices', searchParams, options: filterPrices }),
    categories: getDefaultFilters({ key: 'categories', searchParams, options: categories }),
    query: queryParams || '',
  });

  useEffect(() => {
    onChange(filters);
  }, [filters]);

  const clearFilters = () => {
    setQuery('');
    setFilters({
      prices: getDefaultFilters({ key: 'prices', options: filterPrices }),
      categories: getDefaultFilters({ key: 'categories', options: categories }),
      query: '',
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
  }
  const onQueryChange = (newQuery) => {
    setFilters(prev => ({
      ...prev,
      query: newQuery,
    }));
  }
  const debouncedQuery = useDebounce(query, 2000, onQueryChange)

  // if (isLoading) return <div>Loading...</div>;

  let numFilters = Object.values(filters).reduce(function(total, filterVal) {
    if (typeof filterVal === 'string') return total;

    return total += Object.keys(filterVal).length;
  }, 0);
  if (debouncedQuery && debouncedQuery.trim() !== '') numFilters += 1;


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
            <div className="min-w-0 flex-1 md:w-1/2 pb-8">
              <div className="flex items-center md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none">
                <div className="w-full">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                      placeholder="Search"
                      type="search"
                      value={query}
                      onChange={evt => setQuery(evt.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid auto-rows-min grid-cols-2 gap-y-6">
              <fieldset>
                <legend className="block font-medium">Giá tiền</legend>
                <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                  {filterPrices.map((option, optionIdx) => (
                    <div key={`filter-price-${option.value}`} className="flex items-center text-base sm:text-sm">
                      <input
                        id={`filter-price-${optionIdx}`}
                        name="price[]"
                        type="checkbox"
                        className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        value={option.label}
                        checked={option.value in filters.prices}
                        onChange={() => onChangeFilters('prices', option)}
                      />
                      <label htmlFor={`price-${optionIdx}`} className="ml-3 min-w-0 flex-1 text-gray-600">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="block font-medium">Loại</legend>
                <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                  {categories.map((option, optionIdx) => (
                    <div key={`category-${option.value}`} className="flex items-center text-base sm:text-sm">
                      <input
                        id={`category-${optionIdx}`}
                        type="checkbox"
                        name="category[]"
                        className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        value={option.name}
                        checked={option.value in filters.categories}
                        onChange={() => onChangeFilters('categories', option)}
                      />
                      <label htmlFor={`category-${optionIdx}`} className="ml-3 min-w-0 flex-1 text-gray-600">
                        {option.name}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
              {/* <fieldset>
                <legend className="block font-medium">Color</legend>
                <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                  {filters.color.map((option, optionIdx) => (
                    <div key={option.value} className="flex items-center text-base sm:text-sm">
                      <input
                        id={`color-${optionIdx}`}
                        name="color[]"
                        defaultValue={option.value}
                        type="checkbox"
                        className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        defaultChecked={option.checked}
                      />
                      <label htmlFor={`color-${optionIdx}`} className="ml-3 min-w-0 flex-1 text-gray-600">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset> */}
            </div>
          </div>
        </Disclosure.Panel>
        <div className="col-start-1 row-start-1 py-4">
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
        </div>
      </Disclosure>
    </>
  );
}

export default Filters;