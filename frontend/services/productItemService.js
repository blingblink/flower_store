import prisma from '../app/db';

const verifyProductItem = async ({ productItem }) => {
    const product = await prisma.product.findFirst({
        where: { id: productItem.productId },
    })
    
    let error;
    const result = product.availableItemCount >= productItem.quantity;
    if (!result) error = "Out of stock";

    return {
        ok: result,
        error,
    }
}

export {
    verifyProductItem
}