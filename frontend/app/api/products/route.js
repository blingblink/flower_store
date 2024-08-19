import { getManyProductsByPage, createProduct, modifyProduct, deleteProduct } from "@/services/productService";

const POST = async (req) => {
  const requestBody = await req.json();
  const product = await createProduct({
    name: requestBody.name,
    description: requestBody.description,
    price: requestBody.price,
    categoryName: requestBody.category,
    images: requestBody.images,
    availableItemCount: requestBody.availableItemCount,
  });
  return Response.json(product);
}

const PUT = async (req) => {
  // requestBody: {
  //   name: 'Intelligent Bronze Table',
  //   description: 'Con đạp vẽ. Viết xanh bảy xuồng. Xuồng năm gió gì vá hết tủ nước.<br/>\n' +
  //     'Xuồng sáu thì. Bàn tô đạp mua á con tám. Kim giày chỉ.<br/>\n' +
  //     'Xanh chết thuyền. Thuyền ừ thuê làm leo dép tô đánh đạp. Cửa trời viết thuyền viết.<br/>\n' +
  //     'Áo ngọt nón chỉ hai đạp nón lỗi giày trời. Thích vá biển độc. Mười núi đánh ba yêu tám.<br/>\n' +
  //     'Sáu hàng hóa lầu bơi đang mười sáu. May hóa đánh nước. Sáu bảy hết.',
  //   features: 'Tủ lỗi phá bốn đâu hóa vẽ.<br/>Leo đạp đánh nghỉ cái.<br/>Không xuồng xuồng bạn giày tàu bốn.<br/>Mướn ngọt vá thế tôi ác.<br/>Trời bàn giết được.<br/>Được trăng đập ừ ruộng tôi không giết đập.',
  //   price: 328000,
  //   availableItemCount: 7,
  //   category: 'Hoa cúc',
  //   images: [ [Object], [Object], [Object], [Object], [Object] ],
  //   id: 151
  // }

  const requestBody = await req.json();
  await modifyProduct({
    productId: requestBody.id,
    name: requestBody.name,
    description: requestBody.description,
    price: requestBody.price,
    categoryName: requestBody.category,
    images: requestBody.images,
    availableItemCount: requestBody.availableItemCount,
  });
  return Response.json({});
}

const GET = async (request) => {
  const searchParams = request.nextUrl.searchParams;
  const isPublicStr = searchParams.get('isPublic') || 'false';
  const isPublic = isPublicStr === 'true';
  const page = searchParams.get('page') || 1;
  const pricesParam = searchParams.get('prices') || null;
  const prices = pricesParam && pricesParam.split(',').map(priceFilter => {
    const [minPriceStr, maxPriceStr] = priceFilter.split('..');
    const minPrice = parseFloat(minPriceStr);
    const maxPrice = parseFloat(maxPriceStr);
    return {
      ...(minPrice ? { min: minPrice }: {}),
      ...(maxPrice ? { max: maxPrice }: {}),
    };
  });
  const categoriesParam = searchParams.get('categories') || null;
  const categories = categoriesParam && categoriesParam.split(',');
  const query = searchParams.get('query');

  const result = await getManyProductsByPage({
    query,
    prices,
    categories,
    isPublic,

    // Pagination
    page,
    limit: 12,
  });

  return Response.json(result);
}

const DELETE = async (req) => {
  const requestBody = await req.json();
  await deleteProduct({
    product: requestBody.id,
  });
  return Response.json({});
}


export {
  GET,
  POST,
  PUT,
  DELETE,
}