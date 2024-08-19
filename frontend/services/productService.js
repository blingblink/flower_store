import prisma from '../app/db';

const createProduct = async ({
    name,
    description,
    price,
    categoryName,
    images,
    availableItemCount=0,
}) => {

    const category = await prisma.category.findUnique({
        where: {
            name: categoryName,
        },
    });

    const product = await prisma.product.create({
        data: {
            name,
            description,
            price,
            availableItemCount,
            category: {
                connect: {
                    id: category.id,
                }
            },
        },
    });

    await prisma.productImage.createMany({
        data: images.map(img => ({
            src: img.src,
            product: {
                connect: {
                    id: product.id,
                }
            },
        })),
    });
    
    return product;
};

const modifyProduct = async ({
    productId,
    name,
    description,
    price,
    categoryName,
    images,
    availableItemCount,
}) => {
    const category = await prisma.category.findUnique({
        where: {
            name: categoryName,
        },
    });
    await prisma.productImage.deleteMany({
        where: {
            id: {
                notIn: images.filter(img => !!img.id).map(img => img.id),
            },
            productId,
        }
    });
    await prisma.productImage.createMany({
        data: images.filter(img => !img.id).map(img => ({
            src: img.src,
            productId,
        })),
    });
    const product = await prisma.product.update({
        where: {
            id: productId,
        },
        data: {
            name,
            description,
            price,
            availableItemCount,
            category: {
                connect: {
                    id: category.id,
                }
            },
        },
    });
    return product;
};

const deleteProduct = async ({
    productId,
}) => {
    const product = await prisma.product.delete({
        where: {
            id: productId,
        },
    });
    return product;
};

const getProduct = async ({ productId }) => {
    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
        include: {
            // productReviews: true,
            images: true,
            category: true,
        }
    });
    const aggregatedReviews = await prisma.productReview.aggregate({
        where: { productId: product.id },
        _avg: {
            rating: true,
        },
    });
    return {
        ...product,
        rating: Math.round(aggregatedReviews._avg.rating),
    };
}

const getPopularProducts = async () => {
    const products = await prisma.product.findMany({
        include: {
            category: true,
            images: true,
        },
        orderBy: {
            views: 'desc',
        },
        take: 4,
    });

    return products;
}

const getGoodSellingProducts = async () => {
    const date = new Date();
    // date.setMonth(date.getMonth() - 1);
    date.setHours(0, 0, 0, 0);
    date.setFullYear(date.getFullYear() - 1);

    const lastMonthOrders = await prisma.order.findMany({
        where: {
            createdAt: {
                // From 1 month ago til today
                gte: date,
            },
        },
        include: {
            items: true,
        },
    });
    
    // Calculate the number of purchases per product
    const purchaseCounts = {};
    for (const order of lastMonthOrders) {
        for (const productItem of order.items) {
            purchaseCounts[productItem.productId] = (
                purchaseCounts[productItem.productId]
                ? purchaseCounts[productItem.productId] + 1
                : 1
            );
        }
    }
    const sortedCounts = [];
    for (const productId in purchaseCounts) {
        sortedCounts.push([productId, purchaseCounts[productId]]);
    }

    const goodSellingProductIds = sortedCounts.slice(0, 4).map(pair => parseInt(pair[0]));
    const goodSellingProducts = await prisma.product.findMany({
        where: {
            id: {
                in: goodSellingProductIds,
            }
        },
        include: {
            category: true,
            images: true,
        },
    });

    return goodSellingProducts;
}

const getManyProductsByPage = async ({
    // Filters
    query=null,
    categories=null,
    prices=null,
    isPublic=true,

    // Pagination
    page=1,
    limit=10,
}) => {
    const searchConditions = {
        // Filters
        ...(query && query.trim() !== '' ? {
            name: {
                contains: query,
                mode: 'insensitive',
            },
        } : {}),
        ...(categories ? {
            category: {
                is: {
                    name: {
                        in: categories,
                    }
                }
            }
        } : {}),
        ...(prices ? {
            OR: prices.map(priceFilter => ({
                price: {
                    gte: priceFilter.min,
                    lte: priceFilter.max,
                },
            })),
        } : {}),

        ...(isPublic ? {
            availableItemCount: {
                gt: 0,
            }
        } : {}),
    };

    const products = await prisma.product.findMany({
        where: {
            ...searchConditions,
        },
        include: {
            category: true,
            images: true,
            _count: {
                select: { productReviews: true },
            },
        },
        orderBy: {
            id: 'desc',
        },
        skip: limit * (page - 1),
        take: limit,
    });

    // Aggregate reviews
    const productReviews = await prisma.productReview.groupBy({
        by: ['productId'],
        where: {
            productId: {
                in: products.map(product => product.id),
            },
        },
        _avg: {
            rating: true,
        },
    });
    const numProducts = await prisma.product.count({
        where: searchConditions,
    });

    return {
        data: products.map(product => {
            const productReview = productReviews.find(review => review.productId === product.id);
    
            return {
                rating: Math.round(productReview._avg.rating),
                ...product,
            }
        }),
        totalPages: Math.ceil(numProducts / limit),
    };
}

export {
    createProduct,
    getProduct,
    getManyProductsByPage,
    getPopularProducts,
    getGoodSellingProducts,
    modifyProduct,
    deleteProduct,
};