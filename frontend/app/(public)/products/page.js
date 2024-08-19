'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr';
import Paginator from '@/components/Paginator';
import StarRating from '@/components/StarRating';
import Filters from './Filters';
import {formatCurrency} from '@/app/utils';

const getFromUrl = async ({ url, params }) => {
  // TODO: Define what filters we want to usex`
  const res = await fetch(url + '?' + new URLSearchParams(params));
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    // throw new Error('Failed to fetch data')
  }
 
  return res.json();
}

const ProductsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get('page') || 1;
  const prices = searchParams.get('prices');
  const categories = searchParams.get('categories');
  const query = searchParams.get('query');
  const filters = {
    page,
    ...(prices ? { prices } : {}),
    ...(categories ? { categories } : {}),
    ...(query ? { query } : {}),
  }
  const { data: products, isLoading } = useSWR({
    url: `/api/products`,
    params: filters,
  }, getFromUrl);

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
    const newPageUrl = '/products?' + new URLSearchParams({
      page: 1,
      ...aggregatedFilters,
    });
    router.push(newPageUrl, {
      scroll: false,
      shallow: true,
    })
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <main className="pb-24">
      <div className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">FLOWER YOUR LIFE</h1>
        
      </div>

      {/* Filters */}
      <Suspense fallback={<div>loading filters...</div>}>
        <Filters onChange={onFilterChange} />
      </Suspense>

      {/* Product grid */}
      <Suspense fallback={<div>loading products...</div>}>
        <section aria-labelledby="products-heading" className="mx-auto max-w-7xl overflow-hidden sm:px-6 lg:px-8">
          <h2 id="products-heading" className="sr-only">
            Products
          </h2>

          <div className="-mx-px grid grid-cols-2 border-l border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
            {products.data.map((product) => (
              <div key={product.id} className="group relative border-b border-r border-gray-200 p-4 sm:p-6">
                <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75">
                  <img
                    src={product.images[0].src}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="pb-4 pt-10 text-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    <Link href={`/products/${product.id}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                  <StarRating
                    className="mt-3 flex flex-col items-center"
                    color='text-yellow-400'
                    rating={product.rating}
                  />

                  <p className="mt-1 text-sm text-gray-500">{product._count.productReviews} reviews</p>
                  <p className="mt-4 text-base font-medium text-gray-900">{formatCurrency(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Paginator
          className="mt-10 flex max-w-7xl px-4 sm:px-6 lg:px-8"
          currentPage={parseInt(page)}
          numPages={products.totalPages}
          pathname="/products"
          queryParams={filters}
        />
      </Suspense>
    </main>
  );
}

export default ProductsPage;