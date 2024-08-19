'use client'

import { Fragment, useState, useEffect } from 'react'
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import NumberInput from '@/components/NumberInput';
import {formatCurrency} from '@/app/utils';

async function getShoppingCart(url) {
    const res = await fetch(url);
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.
   
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data')
    }
   
    return res.json();
  }

export default function ShoppingCartPage() {
  const [itemsQuantities, setItemQuantities] = useState({});
  const router = useRouter();
  const { data: shoppingCartData, mutate } = useSWR('/api/shoppingCart', getShoppingCart);

  useEffect(() => {
    if (shoppingCartData && shoppingCartData.data) {
      const quantities = {};
      shoppingCartData.data.items.forEach((productItem) => {
        quantities[productItem.product.id] = productItem.quantity;
      });
      setItemQuantities(quantities);
    }
  }, [shoppingCartData]);

  const shoppingCart = shoppingCartData?.data;
  if (!shoppingCart) return;
  if (shoppingCart.items.length < 1) return (
    <div>No items in shopping cart.</div>
  )

  const addToShoppingCart = async ({ productItem }) => {
    setItemQuantities(prev => ({
      ...prev,
      [productItem.product.id]: prev[productItem.product.id] + 1,
    }))
    const resp = await fetch("/api/shoppingCart", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: parseInt(productItem.product.id),
      }),
    })
  };

  const reduceItemFromShoppingCart = async ({ productItem }) => {
    setItemQuantities(prev => ({
      ...prev,
      [productItem.product.id]: prev[productItem.product.id] - 1,
    }))
    const resp = await fetch("/api/shoppingCart", {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: parseInt(productItem.product.id),
      }),
    })
  };

  const removeFromShoppingCart = async ({ productItem }) => {
    const resp = await fetch("/api/shoppingCart", {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: parseInt(productItem.product.id),
        delete: true,
      }),
    });
    mutate();
  };
  
  return (
    <div className="bg-white">
      <main>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-0">
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Giỏ hàng</h1>
          <form className="mt-12">
            <section aria-labelledby="cart-heading">
              <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
              </h2>
              <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
                {shoppingCart && shoppingCart.items.map((productItem) => (
                  <li key={productItem.product.id} className="flex py-6">
                    <div className="flex-shrink-0">
                      <img
                        src={productItem.product.images[0].src}
                        alt={productItem.product.name}
                        className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="text-sm">
                            <a href={`/products/${productItem.product.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                              {productItem.product.name}
                            </a>
                          </h4>
                          <p className="ml-4 text-sm font-medium text-gray-900">{formatCurrency(productItem.price)}</p>
                        </div>
                        
                        {/* <p className="mt-1 text-sm text-gray-500">{productItem.quantity}</p> */}
                        <NumberInput
                          value={itemsQuantities[productItem.product.id] || 0}
                          onIncrease={() => addToShoppingCart({ productItem })}
                          onDecrease={() => reduceItemFromShoppingCart({ productItem })}
                        />
                      </div>

                      <div className="mt-4 flex flex-1 items-end justify-between">
                        <div className="">
                          <button
                            type="button"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            onClick={async () => removeFromShoppingCart({ productItem })}
                          >
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Order summary */}
            <section aria-labelledby="summary-heading" className="mt-10">
              <h2 id="summary-heading" className="sr-only">
                Order summary
              </h2>

              {/* <div>
                <dl className="space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-base font-medium text-gray-900">Subtotal</dt>
                    <dd className="ml-4 text-base font-medium text-gray-900">$96.00</dd>
                  </div>
                </dl>
                <p className="mt-1 text-sm text-gray-500">Shipping and taxes will be calculated at checkout.</p>
              </div> */}

              <div className="mt-10">
                <button
                  type="button"
                  className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                  onClick={() => router.push('/checkout')}
                >
                  Thanh toán
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>
                  hoặc
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Tiếp tục mua sắm
                    <span aria-hidden="true"> &rarr;</span>
                  </a>
                </p>
              </div>
            </section>
          </form>
        </div>

      
        
      </main>

      
    </div>
  )
}