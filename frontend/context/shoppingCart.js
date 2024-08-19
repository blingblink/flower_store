'use client'

import { createContext, useState } from "react";

export const shoppingCartContext = createContext({});

export const ShoppingCartProvider = ({ children }) => {
  const [shoppingCart, setShoppingCart] = useState(null);
  
  const value = {
    shoppingCart,
    setShoppingCart,
  }

  return <shoppingCartContext.Provider value={value}>{children}</shoppingCartContext.Provider>;
}
