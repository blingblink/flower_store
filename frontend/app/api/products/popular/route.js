import { getPopularProducts } from "@/services/productService";

const GET = async () => {
  const products = await getPopularProducts();
  return Response.json(products);
}


export {
  GET,
}