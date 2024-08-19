import prisma from '../app/db';
import { compare, hash } from "bcryptjs";
import { UserRoles } from '../constants';

const getAllUsersByPage = async ({
    // Pagination
    page=1,
    limit=10,
}) => {
    const searchConditions = {
        role: {
            notIn: [UserRoles.Admin, UserRoles.Guest],
        },
    };
    const users = await prisma.user.findMany({
        where: {
            ...searchConditions,
        },
        include: {
            addresses: true,
        },
        orderBy: {
            id: 'desc',
        },
        skip: limit * (page - 1),
        take: limit,
    });
    const numUsers = await prisma.user.count({
        where: searchConditions,
    });
    return {
        data: users,
        totalPages: Math.ceil(numUsers / limit),
    };
}

const createGuestUser = async () => {
    return await prisma.user.create({
        data: {
            name: 'Guest',
            role: UserRoles.Guest,
        }
    })
};

const getUser = async ({ id }) => {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            paymentMethods: true,
            addresses: true,
        },
    });
}

const updateUser = async ({ id, ...updateData }) => {
    return await prisma.user.update({
        where: { id },
        data: {
            name: updateData.name,
            email: updateData.email,
            phone: updateData.phone,
            role: updateData.role,
            image: updateData.image,
            scores: updateData.scores,
        },
    });
}

const upgradeCustomerRole = async ({ userId }) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if ([UserRoles.Admin, UserRoles.Employee].includes(user.role)) return;

    if (user.scores >= 1000) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                role: UserRoles.SilverCustomer,
            }
        });
    }
    else if (user.scores >= 2000) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                role: UserRoles.GoldCustomer,
            }
        });
    }

    else if (user.scores >= 5000) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                role: UserRoles.PlatinumCustomer,
            }
        });
    }
    
}

const updateUserPassword = async ({ userId, currentPassword, newPassword }) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    const isSamePassword = await compare(currentPassword, user.password);
    if (!isSamePassword) return false;

    const password = await hash(newPassword, 12);
    await prisma.user.update({
        where: { id: userId },
        data: { password },
    });
    return true;
}



export {
    getAllUsersByPage,
    createGuestUser,
    getUser,
    updateUser,
    updateUserPassword,
    upgradeCustomerRole,
};