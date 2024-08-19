import prisma from '../app/db';

const createDiscount = async ({
    code,
    value,
    type,
}) => {
    const discount = await prisma.discount.create({
        data: {
            code,
            value,
            type,
        },
    });
    
    return discount;
};

const modifyDiscount = async ({
    code,
    value,
    type,
    isActive,
    fromDate,
    toDate,
}) => {
    const discount = await prisma.discount.update({
        where: {
            code,
        },
        data: {
            value,
            type,
            isActive,
            fromDate: fromDate ? new Date(fromDate) : null,
            toDate: toDate ? new Date(toDate) : null,
        },
    });
    return discount;
};

const deleteDiscount = async ({
    code,
}) => {
    await prisma.discount.delete({
        where: {
            code
        },
    });
    return;
};

const getDiscount = async ({ code }) => {
    const today = new Date();
    const discount = await prisma.discount.findUnique({
        where: {
            code,
        },
    });
    if (
        !discount ||
        (discount.fromDate && discount.fromDate > today) ||
        (discount.toDate && discount.toDate < today)
    ) return null;

    return discount;
}

const getManyDiscountsByPage = async ({
    // Pagination
    page=1,
    limit=10,
}) => {
    const searchConditions = {};
    const discounts = await prisma.discount.findMany({
        where: searchConditions,
        orderBy: {
            id: 'desc',
        },
        skip: limit * (page - 1),
        take: limit,
    });

    const numDiscounts = await prisma.discount.count({
        where: searchConditions,
    });

    return {
        data: discounts,
        totalPages: Math.ceil(numDiscounts / limit),
    };
}

const getDiscountsForUser = async ({
    user,
}) => {
    const today = new Date();
    const searchConditions = {
        AND: [
            {
                isActive: true,
            },
            {
                OR: [
                    {
                        fromDate: null,
                    },
                    {
                        fromDate: {
                            gte: today,
                        },
                    }
                ]
            },
            {
                OR: [
                    {
                        toDate: null,
                    },
                    {
                        toDate: {
                            lte: today,
                        },
                    },
                ]
            },
            {
                OR: [
                    {
                        userRole: null,
                    },
                    {
                        userRole: user.role,
                    },
                ],  
            }
        ],
    };
    const discounts = await prisma.discount.findMany({
        where: searchConditions,
        orderBy: {
            id: 'desc',
        },
    });
    return discounts;
}

export {
    createDiscount,
    getDiscount,
    getManyDiscountsByPage,
    getDiscountsForUser,
    modifyDiscount,
    deleteDiscount,
};