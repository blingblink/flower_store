'use client'

import { useState, Suspense, useContext, useEffect } from 'react'
import { shoppingCartContext } from '@/context/shoppingCart';

import useSWR from "swr";
import Image from 'next/image';
import { Disclosure, RadioGroup, Tab } from '@headlessui/react'
import {
  HeartIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import classNames from 'classnames';
import StarRating from '@/components/StarRating';
// import RelatedProducts from '@/components/RelatedProducts';
import CollapseDetails from '@/components/CollapseDetails';
import CustomerReviews from '@/components/CustomerReviews';
import NumberInput from '@/components/NumberInput';
import {formatCurrency } from '@/app/utils';

const relatedProducts = [
  {
    id: 1,
    name: 'Zip Tote Basket',
    color: 'White and black',
    href: '#',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/product-page-03-related-product-01.jpg',
    imageAlt: 'Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.',
    price: '$140',
  },
  // More products...
]

async function getProduct(url) {
  const res = await fetch(url);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
 
  return res.json();
}

export default function ProductDetailsPage({ params }) {
  const { id } = params;
  const { shoppingCart } = useContext(shoppingCartContext);
  const [numberItemsInCart, setNumberItemsInCart] = useState(0);
  const { data: product, isLoading } = useSWR(`/api/products/${id}`, getProduct);

  useEffect(() => {
    if (!shoppingCart) return;

    const intId = parseInt(id);
    const productItem = shoppingCart.items.find(item => item.productId === intId);
    if (!productItem) return;
    
    setNumberItemsInCart(productItem.quantity);
  }, [shoppingCart])

  const addToShoppingCart = async () => {
    setNumberItemsInCart((prevNum) => prevNum + 1);
    const resp = await fetch("/api/shoppingCart", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: parseInt(id),
      }),
    })
  }

  const removeFromShoppingCart = async () => {
    setNumberItemsInCart((prevNum) => prevNum - 1);
    const resp = await fetch("/api/shoppingCart", {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: parseInt(id),
      }),
    })
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <Suspense fallback={<div>loading reviews...</div>}>
          {/* Product */}
          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery */}
          <Tab.Group as="div" className="flex flex-col-reverse">
              {/* Image selector */}
              <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <Tab.List className="grid grid-cols-4 gap-6">
                  {product.images.map((image) => (
                  <Tab
                      key={image.id}
                      className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                  >
                      {({ selected }) => (
                      <>
                          <span className="sr-only">{image.name}</span>
                          <span className="absolute inset-0 overflow-hidden rounded-md">
                          <img loading="lazy" src={image.src} alt="" className="h-full w-full object-cover object-center" />
                          </span>
                          <span
                          className={classNames(
                              selected ? 'ring-indigo-500' : 'ring-transparent',
                              'pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2'
                          )}
                          aria-hidden="true"
                          />
                      </>
                      )}
                  </Tab>
                  ))}
              </Tab.List>
              </div>

              <Tab.Panels className="aspect-h-1 aspect-w-1 w-full">
              {product.images.map((image) => (
                  <Tab.Panel key={image.id}>
                  <img
                      loading="lazy"
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover object-center sm:rounded-lg"
                  />
                  </Tab.Panel>
              ))}
              </Tab.Panels>
          </Tab.Group>

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>

              <div className="mt-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-3xl tracking-tight text-gray-900">{formatCurrency(product.price)}</p>
              </div>

              {/* Reviews */}
              <StarRating rating={product.rating} className="mt-3" color="text-yellow-400" />

              <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <div
                    className="space-y-6 text-base text-gray-700"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              <form className="mt-6">
                {/* Colors */}
                {/* <div>
                    <h3 className="text-sm text-gray-600">Color</h3>

                    <RadioGroup value={selectedColor} onChange={setSelectedColor} className="mt-2">
                    <RadioGroup.Label className="sr-only">Choose a color</RadioGroup.Label>
                    <div className="flex items-center space-x-3">
                        {product.colors.map((color) => (
                          <RadioGroup.Option
                              key={color.name}
                              value={color}
                              className={({ active, checked }) =>
                              classNames(
                                  color.selectedColor,
                                  active && checked ? 'ring ring-offset-1' : '',
                                  !active && checked ? 'ring-2' : '',
                                  'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none'
                              )
                              }
                          >
                              <RadioGroup.Label as="span" className="sr-only">
                                {color.name}
                              </RadioGroup.Label>
                              <span
                                aria-hidden="true"
                                className={classNames(
                                    color.bgColor,
                                    'h-8 w-8 rounded-full border border-black border-opacity-10'
                                )}
                              />
                          </RadioGroup.Option>
                        ))}
                    </div>
                    </RadioGroup>
                </div> */}

                <div className="mt-10 flex">
                    {numberItemsInCart > 0 ? (
                      <NumberInput
                        value={numberItemsInCart}
                        onChange={setNumberItemsInCart}
                        onIncrease={addToShoppingCart}
                        onDecrease={removeFromShoppingCart}
                      />
                    ) : (
                      <button
                        type="button"
                        className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                        onClick={addToShoppingCart}
                      >
                        Thêm vào giỏ hàng
                      </button>
                    )}

                    <button
                    type="button"
                    className="ml-4 flex items-center justify-center rounded-md px-3 py-3 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    >
                      <HeartIcon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                      <span className="sr-only">Add to favorites</span>
                    </button>
                </div>
              </form>
              
              <CollapseDetails
                className="mt-12"
                details={product.details}
                srText="Additional details"
              />
          </div>
          </div>
          </Suspense>
          {/* <Suspense fallback={<div>loading related products...</div>}>
            <RelatedProducts relatedProducts={relatedProducts} />
          </Suspense> */}
          <Suspense fallback={<div>loading reviews...</div>}>
            <CustomerReviews product={product} />
          </Suspense>
      </div>
    </main>
  )
}
