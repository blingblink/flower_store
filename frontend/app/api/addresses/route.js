import { getCurrentUser } from '@/app/api/utils';
import { addAddress, updateAddress, deleteAddress } from '@/services/addressService';

const POST = async (req) => {
  const user = await getCurrentUser();
  const requestBody = await req.json();
  await addAddress({
    ...requestBody,
    userId: user.id,
  });
  return Response.json({});
}

const PUT = async (req) => {
  // const user = await getCurrentUser();
  const requestBody = await req.json();
  await updateAddress(requestBody);
  return Response.json({});
}

const DELETE = async (req) => {
  // const user = await getOrCreateGuest();
  const requestBody = await req.json();
  await deleteAddress(requestBody);
  return Response.json({});
}

export {
  POST,
  PUT,
  DELETE,
}