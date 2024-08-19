import { getOrder } from "@/services/orderService";
import { getCurrentUser } from "../../utils";

const GET = async (req, { params }) => {
  const { orderNumber } = params;
  const order = await getOrder({ orderNumber });

  // const user = await getCurrentUser();
  // if (order.user.id !== user.id) return Response.json({});

  return Response.json(order);
}


export {
  GET,
}