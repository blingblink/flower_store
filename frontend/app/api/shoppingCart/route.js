import prisma from '@/app/db';
import { addProductToCart, reduceProductItemFromCart, getShoppingCartForUser, deleteProductFromCart } from '@/services/shoppingCartService';
import { createGuestUser } from "@/services/userService";
import { getCurrentUser } from '@/app/api/utils';

const getOrCreateGuest = async () => {
  const user = await getCurrentUser();
  return user || await createGuestUser();
}

const GET = async () => {
  // TODO: support guest user
  const user = await getCurrentUser();
  if (!user) return Response.json({
    data: null,
  });

  const shoppingCart = await getShoppingCartForUser({ user });
  return Response.json({
    data: shoppingCart,
  });
}

// Add new item to shopping cart
const POST = async (req) => {
  // { session: null, requestBody: { productId: '106' } }
  const user = await getOrCreateGuest();
  const requestBody = await req.json();
  const product = await prisma.product.findUnique({
    where: { id: requestBody.productId },
  })
  await addProductToCart({
    product,
    user,
  })
  return Response.json({});
}

const DELETE = async (req) => {
  const user = await getOrCreateGuest();
  const requestBody = await req.json();
  if (requestBody.delete) {
    const product = await prisma.product.findUnique({
      where: { id: requestBody.productId },
    })
    await deleteProductFromCart({
      product,
      user,
    });
    return Response.json({});
  }

  const product = await prisma.product.findUnique({
    where: { id: requestBody.productId },
  });
  await reduceProductItemFromCart({
    product,
    user,
  })
  return Response.json({});
}



export {
  GET,
  POST,
  DELETE,
}