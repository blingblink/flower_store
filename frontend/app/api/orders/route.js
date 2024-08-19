import { getCurrentUser } from '@/app/api/utils';
import { createOrder, getManyOrdersByPage, changeOrderStatus } from '@/services/orderService';

const GET = async (request) => {
  const user = await getCurrentUser();
  if (!user) return Response.json({
    data: null,
  });
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || 1;
  if (!page) throw new Error(`Missing 'page' query parameter`);

  const getAll = searchParams.get('all') || 'false';
  const statusesStr = searchParams.get('statuses') || '';
  const statuses = statusesStr.split(',').filter(status => status.trim() !== '');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const paymentMethodsStr = searchParams.get('paymentMethods') || '';
  const paymentMethods = paymentMethodsStr.split(',').filter(method => method.trim() !== '');

  let orders;
  if (getAll === 'true') {
    orders = await getManyOrdersByPage({
      page,
      statuses,
      fromDate,
      toDate,
      paymentMethods,
      limit: 5,
    });
  } else {
    orders = await getManyOrdersByPage({
      user,
      page,
      statuses,
      fromDate,
      toDate,
      paymentMethods,
      limit: 5,
    });
  }
  return Response.json(orders);
}

const POST = async (req) => {
  const user = await getCurrentUser();
  if (!user) return Response.json({
    data: null,
  });
  console.log({user})
  const requestBody = await req.json();
  const order = await createOrder({ user, discountCode: requestBody.discountCode });
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