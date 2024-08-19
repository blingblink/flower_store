import { getProductReviews } from "@/services/productReviewService";

const GET = async (request, { params }) => {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || 1;
    const { id } = params;

    const result = await getProductReviews({
        productId: parseInt(id),

        // Pagination
        page,
        limit: 5,
    });
    
    return Response.json(result);
}

export {
    GET,
}