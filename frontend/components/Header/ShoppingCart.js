'use client'

import { useContext, useEffect } from 'react'
import { shoppingCartContext } from '@/context/shoppingCart';
import Link from 'next/link';
import useSWR from 'swr';
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

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
const ShoppingCart = () => {
  const { setShoppingCart } = useContext(shoppingCartContext);
  const { data: shoppingCartData } = useSWR('/api/shoppingCart', getShoppingCart);
  const numItemsInCart = shoppingCartData?.data?.items?.length || 0;

  useEffect(() => {
    if (setShoppingCart && shoppingCartData) {
      setShoppingCart(shoppingCartData.data);
    }
  }, [setShoppingCart, shoppingCartData])

  return (
    <Link href="/shopping_cart" className="group -m-2 flex items-center p-2">
      <ShoppingBagIcon
          className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"
      />
      <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
        {numItemsInCart}
      </span>
      <span className="sr-only">items in cart, view bag</span>
    </Link>
  );
}

export default ShoppingCart;