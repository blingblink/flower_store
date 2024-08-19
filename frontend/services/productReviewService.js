import prisma from '../app/db';

const addProductReview = async ({ 
    product,
    review,
    rating,
}) => {
    const productReview = await prisma.productReview.create({
        data: {
            productId: product.id,
            review,
            rating,
        },
    });
    return productReview;
}


const getProductReviews = async ({
    // Filters
    productId,

    // Pagination
    page=1,
    limit=5,
}) => {
    const searchConditions = { productId };
    const reviews = await prisma.productReview.findMany({
        where: searchConditions,
        include: {
            user: true,
        },
        orderBy: {
            rating: 'desc',
        },
        skip: limit * (page - 1),
        take: limit,
    });
    
    // Aggregated
    const reviewCounts = (await prisma.productReview.groupBy({
        by: ['rating'],
        where: searchConditions,
        orderBy: {
            rating: 'desc',
        },
        _count: {
            rating: true,
        },
    })).map(count => ({
        rating: count.rating,
        count: count._count.rating,
    }));
    const aggregatedReviews = await prisma.productReview.aggregate({
        where: searchConditions,
        _avg: {
            rating: true,
        },
        _count: {
            id: true,
        },
    });
    const numReviews = aggregatedReviews._count.id;

    return {
        average: aggregatedReviews._avg.rating,
        totalCount: numReviews,
        counts: reviewCounts,
        data: reviews,
        totalPages: Math.ceil(numReviews / limit),
    };
}

export {
    addProductReview,
    getProductReviews,
 };