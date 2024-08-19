import prisma from '../app/db';

const addAddress = async ({ userId, ...addressData }) => {
    return await prisma.address.create({
        data: {
            ...addressData,
            user: {
                connect: {id: userId }
            }
        }
    })
}

const updateAddress = async ({ id, ...addressData }) => {
    return await prisma.address.update({
        where: { id },
        data: addressData,
    })
}

const deleteAddress = async ({ id }) => {
    return await prisma.address.update({
        where: { id },
        data: {
            user: {
                disconnect: true,
            }
        }
    })
}


export {
    addAddress,
    updateAddress,
    deleteAddress,
};