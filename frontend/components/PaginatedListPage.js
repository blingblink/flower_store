'use client'

import { useSearchParams } from 'next/navigation'
import useSWR from 'swr';
import Paginator from '@/components/Paginator';
import MutableList from '@/components/MutableList';
import ReadOnlyList from '@/components/ReadOnlyList';

const getFromUrl = async ({ url, params }) => {
  const res = await fetch(url + '?' + new URLSearchParams(params));
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    // throw new Error('Failed to fetch data')
  }
 
  const jsonRes = JSON.parse(
    await res.text(),
    (key, val) => {
      if (key === 'category') return val.name;
      return val;
    }
  );
  return jsonRes
}

const PaginatedListPage = ({ 
  apiUrl,
  pathname,
  params={},
  pageParam='page',
  isMutable=true,
  ...props
}) => {
  const searchParams = useSearchParams();
  const page = searchParams.get(pageParam) || 1;
  const { data, isLoading, error, mutate } = useSWR({
    url: apiUrl,
    params: {
      ...params,
      [pageParam]: page,
    },
  }, getFromUrl);

  if (isLoading) return <div>Loading...</div>;

  const { data: values, totalPages } = data;
  props.values = values || [];
  const queryParams = {};
  searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  return (
    <div>
        {isMutable ? (
          <MutableList
            mutate={mutate}
            {...props}
          />
        ) : (
          <ReadOnlyList
            mutate={mutate}
            {...props}
          />
        )}
        <Paginator
            className="mt-4 sm:mt-6"
            currentPage={parseInt(page)}
            numPages={totalPages || 0}
            pathname={pathname}
            scroll={false}
            pageParam={pageParam}
            queryParams={queryParams}
            mutate={mutate}
        />
    </div>
  );
}

export default PaginatedListPage;