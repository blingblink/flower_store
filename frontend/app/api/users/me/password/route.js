import { getCurrentUser } from '@/app/api/utils';
import { updateUserPassword } from '@/services/userService';

const PUT = async (req) => {
  const user = await getCurrentUser();
  const requestBody = await req.json();

  await updateUserPassword({
    ...requestBody,
    userId: user.id,
  });
  return Response.json({});
}


export {
  PUT,
}