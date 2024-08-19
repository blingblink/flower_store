import { getCurrentUser } from '@/app/api/utils';
import { getUser } from '@/services/userService';

// Add new item to shopping cart
const GET = async () => {
  const user = await getCurrentUser();
  if (!user) return Response.json({});

  const fullUser = await getUser({ id: user.id });
  return Response.json(fullUser);
}

export {
  GET,
}