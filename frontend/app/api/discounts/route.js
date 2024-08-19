import { getManyDiscountsByPage, createDiscount, modifyDiscount, deleteDiscount, getDiscount, getDiscountsForUser } from "@/services/discountService";
import { getCurrentUser } from "../utils";
import { getUser } from "@/services/userService";

const POST = async (req) => {
  const requestBody = await req.json();
  const discount = await createDiscount(requestBody);
  return Response.json(discount);
}

const PUT = async (req) => {
  const requestBody = await req.json();
  const discount = await modifyDiscount(requestBody);
  return Response.json(discount);
}

const GET = async (request) => {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  if (code) {
    const discount = await getDiscount({ code });
    return Response.json(discount);
  }

  // Get many discounts to apply on checkout page
  const forSelf = searchParams.get('forSelf') || 'false';
  if (forSelf === 'true') {
    const sessionUser = await getCurrentUser();
    const user = await getUser({ id: sessionUser.id });
    const discounts = await getDiscountsForUser({ user });
    return Response.json(discounts);
  }
  
  const page = searchParams.get('page') || 1;
  const result = await getManyDiscountsByPage({
    // Pagination
    page,
    limit: 12,
  });

  return Response.json(result);
}

const DELETE = async (req) => {
  const requestBody = await req.json();
  await deleteDiscount({
    code: requestBody.code
  });
  return Response.json({});
}


export {
  GET,
  POST,
  PUT,
  DELETE,
}