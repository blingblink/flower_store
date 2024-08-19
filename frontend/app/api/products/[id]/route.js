import { getProduct } from "@/services/productService";

const GET = async (req, { params }) => {
  const { id } = params;
  const product = await getProduct({ productId: parseInt(id) });
  return Response.json({
    ...product,
    details: [
      {
        name: 'Features',
        items: product.features.split('<br/>'),
      }
    ]
  });
}


export {
  GET,
}