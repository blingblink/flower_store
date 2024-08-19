import prisma from '../app/db';

const getPaymentMethodsForUser = async ({ user }) => {
    return await prisma.paymentMethod.findMany({
        where: {
            userId: user.id,
        }
    });
}

const addPaymentMethod = async ({ user, paymentMethod }) => {
    const exisitngMethods = await prisma.paymentMethod.findMany({
        where: {
            userId: user.id,
        }
    });
    const isFirstMethod = exisitngMethods.length === 0;

    return await prisma.paymentMethod.create({
        data: {
            ...paymentMethod,
            isDefault: isFirstMethod,
            userId: user.id,
        },
    })
};

export {
    addPaymentMethod,
    getPaymentMethodsForUser,
};