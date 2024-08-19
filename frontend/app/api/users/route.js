import { getCurrentUser, getDetailedCurrentUser } from '@/app/api/utils';
import { getAllUsersByPage, updateUser } from '@/services/userService';
import { isAdmin } from '@/lib/permissions';

// Add new item to shopping cart
const GET = async (request) => {
  const user = await getCurrentUser();
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || 1;
  
  const result = await getAllUsersByPage({
    // Pagination
    page,
    limit: 10,
  });
  return Response.json(result);
}

const PUT = async (req) => {
  const user = await getDetailedCurrentUser();
  const requestBody = await req.json();
  if (user.id === requestBody.id || isAdmin({ user })) {
    await updateUser(requestBody);
  }
  return Response.json({});
}

// const DELETE = async (req) => {
//   const user = await getOrCreateGuest();
//   const requestBody = await req.json();
//   const product = await prisma.product.findUnique({
//     where: { id: requestBody.productId },
//   })
//   await reduceProductItemFromCart({
//     product,
//     user,
//   })
//   return Response.json({});
// }

export {
  GET,
  PUT,
}