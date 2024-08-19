'use client'

import { useState } from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { StarIcon } from '@heroicons/react/20/solid'
import classNames from "classnames";
import StarRating from './StarRating';
import Paginator from './Paginator';

async function getProductReviews(url) {
  const res = await fetch(url);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
  
  return res.json();
}

const CustomerReviews = ({ product, pathname }) => {
  const searchParams = useSearchParams();
  const page = searchParams.get('page') || 1;
  const { data: reviews, isLoading } = useSWR(`/api/products/${product.id}/reviews?page=${page}`, getProductReviews);
  if (isLoading) return <div>Loading...</div>;

  return (
      <section aria-labelledby="reviews-heading" className="mt-10 border-t border-gray-200 px-4 py-16 sm:px-0">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-x-8 lg:px-8">
          <div className="lg:col-span-4">
            <h2 id="reviews-heading" className="text-2xl font-bold tracking-tight text-gray-900">
              Đánh giá 
            </h2>

            <div className="mt-3 flex items-center">
              <StarRating rating={product.rating} color="text-yellow-400" />
              <p className="ml-2 text-sm text-gray-900">Dựa trên {reviews.totalCount} đánh giá</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Review data</h3>

              <dl className="space-y-3">
                {reviews.counts.map((count) => (
                  <div key={count.rating} className="flex items-center text-sm">
                    <dt className="flex flex-1 items-center">
                      <p className="w-3 font-medium text-gray-900">
                        {count.rating}
                        <span className="sr-only"> star reviews</span>
                      </p>
                      <div aria-hidden="true" className="ml-1 flex flex-1 items-center">
                        <StarIcon
                          className={classNames(
                            count.count > 0 ? 'text-yellow-400' : 'text-gray-300',
                            'h-5 w-5 flex-shrink-0'
                          )}
                          aria-hidden="true"
                        />

                        <div className="relative ml-3 flex-1">
                          <div className="h-3 rounded-full border border-gray-200 bg-gray-100" />
                          {count.count > 0 ? (
                            <div
                              className="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"
                              style={{ width: `calc(${count.count} / ${reviews.totalCount} * 100%)` }}
                            />
                          ) : null}
                        </div>
                      </div>
                    </dt>
                    <dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-900">
                      {Math.round((count.count / reviews.totalCount) * 100)}%
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-900">Đánh giá</h3>
              <p className="mt-1 text-sm text-gray-600">
                Hãy để lại bình luận nếu đã mua sản phẩm
              </p>

              <a
                href="#"
                className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 sm:w-auto lg:w-full"
              >
                Viết đánh giá
              </a>
            </div>
          </div>

          <div className="mt-16 lg:col-span-7 lg:col-start-6 lg:mt-0">
            <h3 className="sr-only">Recent reviews</h3>

            <div className="flow-root">
              <div className="-my-12 divide-y divide-gray-200">
                {reviews.data.map((review) => (
                  <div key={review.id} className="py-12">
                    <div className="flex items-center">
                      <img src={review.user.image} alt={`${review.user.name}`} className="h-12 w-12 rounded-full" />
                      <div className="ml-4">
                        <h4 className="text-sm font-bold text-gray-900">{review.user.name}</h4>
                        <div className="mt-1 flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIcon
                              key={rating}
                              className={classNames(
                                review.rating > rating ? 'text-yellow-400' : 'text-gray-300',
                                'h-5 w-5 flex-shrink-0'
                              )}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <p className="sr-only">{review.rating} out of 5 stars</p>
                      </div>
                    </div>

                    <div
                      className="mt-4 space-y-6 text-base italic text-gray-600"
                      dangerouslySetInnerHTML={{ __html: review.review }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <Paginator
              className="mt-12 sm:mt-16"
              currentPage={parseInt(page)}
              numPages={reviews.totalPages}
              pathname={pathname}
              scroll={false}
            />
          </div>
        </div>
      </section>
  );
}

export default CustomerReviews;