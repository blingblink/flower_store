import { getCurrentUser } from '@/app/api/utils';
import { createOrder, getManyOrdersForUserShippingByPage, getManyOrdersReadyToShipByPage, changeOrderStatus } from '@/services/orderService';

const GET = async (request) => {
  const user = await getCurrentUser();
  if (!user) return Response.json({
    data: null,
  });
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || 1;
  const forSelf = searchParams.get('forSelf') === 'true';
  if (!page) throw new Error(`Missing 'page' query parameter`);

  let orders;
  if (forSelf) {
    orders = await getManyOrdersForUserShippingByPage({
      user,
      page,
      limit: 5,
    });
  } else {
    orders = await getManyOrdersReadyToShipByPage({
      page,
      limit: 5,
    });
  }
  return Response.json(orders);
}

const POST = async () => {
  const user = await getCurrentUser();
  if (!user) return Response.json({
    data: null,
  });

  const order = await createOrder({ user });
  return Response.json(order);
}

const PUT = async (req) => {
  const user = await getCurrentUser();
  const requestBody = await req.json();
  const order = await changeOrderStatus({
    ...requestBody,
    doneByUserId: requestBody.doneByUserId || user.id,
  });
  return Response.json(order);
}


export {
  GET,
  POST,
  PUT,
}