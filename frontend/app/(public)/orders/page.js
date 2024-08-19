'use client'
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr';
import Paginator from '@/components/Paginator';
import { formatCurrency } from '@/app/utils';


async function getFromUrl(url) {
  const res = await fetch(url);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    // throw new Error('Failed to fetch data')
  }
 
  return res.json();
}

export default function OrderHistoryPage() {
  const searchParams = useSearchParams();
  const pageNumber = searchParams.get('page') || 1;
  const { data: orders } = useSWR(`/api/orders?page=${pageNumber}`, getFromUrl);

  const reBuyProduct = async (productItem) => {
    const resp = await fetch('/api/shoppingCart', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productItem),
    });
  }

  console.log({orders})

  return (
    <div className="">
      <Suspense fallback={<div>loading orders...</div>}>
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:pb-32 sm:pt-24 lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Orders</h1>
          <p className="mt-2 text-sm text-gray-500">
            Check the status of recent orders, manage returns, and discover similar products.
          </p>
        </div>

        <div className="mt-12 space-y-16 sm:mt-16">
          {orders?.data && orders.data.map((order) => (
            <section key={order.orderNumber} aria-labelledby={`${order.orderNumber}-heading`}>
              <div className="space-y-1 md:flex md:items-baseline md:space-x-4 md:space-y-0">
                <h2 id={`${order.orderNumber}-heading`} className="text-lg font-medium text-gray-900 md:flex-shrink-0">
                  Order #{order.orderNumber}
                </h2>
                <div className="space-y-5 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 md:min-w-0 md:flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    {order.status}
                  </p>
                  <div className="flex text-sm font-medium">
                    <Link href={`/orders/${order.orderNumber}`} className="text-indigo-600 hover:text-indigo-500">
                      View details
                    </Link>
                  </div>
                </div>
              </div>

              <div className="-mb-6 mt-6 flow-root divide-y divide-gray-200 border-t border-gray-200">
                {order.items.map((productItem) => (
                  <div key={productItem.id} className="py-6 sm:flex">
                    <div className="flex space-x-4 sm:min-w-0 sm:flex-1 sm:space-x-6 lg:space-x-8">
                      <img
                        src={productItem.product.images[0].src}
                        alt={productItem.product.name}
                        className="h-20 w-20 flex-none rounded-md object-cover object-center sm:h-48 sm:w-48"
                      />
                      <div className="min-w-0 flex-1 pt-1.5 sm:pt-0">
                        <h3 className="text-sm font-medium text-gray-900">
                          <Link href={`/products/${productItem.product.id}`}>{productItem.product.name}</Link>
                        </h3>
                        {/* <p className="truncate text-sm text-gray-500">
                          <span>{product.color}</span>{' '}
                          <span className="mx-1 text-gray-400" aria-hidden="true">
                            &middot;
                          </span>{' '}
                          <span>{product.size}</span>
                        </p> */}
                        <p className="mt-1 font-medium text-gray-500">{formatCurrency(productItem.price)}</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4 sm:ml-6 sm:mt-0 sm:w-40 sm:flex-none">
                      {/* <button
                        type="button"
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-2.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-full sm:flex-grow-0"
                        onClick={async () => await reBuyProduct(product) }
                      >
                        Buy again
                      </button> */}
                      {/* <button
                        type="button"
                        className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-full sm:flex-grow-0"
                      >
                        Shop similar
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {orders?.data && (
          <Paginator
            className="mt-12 sm:mt-16"
            currentPage={parseInt(pageNumber)}
            numPages={orders.totalPages}
            pathname="/orders"
          />
        )}
      </main>
      </Suspense>
    </div>
  )
}
