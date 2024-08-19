import { getGoodSellingProducts } from "@/services/productService";

const GET = async () => {
  const products = await getGoodSellingProducts();
  return Response.json(products);
}


export {
  GET,
}