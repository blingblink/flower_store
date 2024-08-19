import { Prisma } from '@prisma/client';
import prisma from '../app/db';
import { generateRandomString } from '../app/utils';
import { OrderStatus, PaymentStatus, ShipmentStatus, DiscountType } from '../constants';
import { getShoppingCartForUser, checkoutShoppingCartForUser } from './shoppingCartService';
import { verifyProductItem } from './productItemService';
import { upgradeCustomerRole } from './userService';
import { stripe } from '../lib/stripe';

const getOrder = async ({ orderNumber }) => {
    const order = await prisma.order.findUnique({
        where: { orderNumber: orderNumber.toUpperCase() },
        include: {
            user: true,
            payments: {
                include: {
                    paymentMethod: true,
                },
            },
            items: {
                include: {
                    product: {
                        include: {
                            images: true,
                        }
                    }
                }
            },
            shipments: {
                include: {
                    shipmentLogs: {
                        include: {
                            doneByUser: true,
                        }
                    },
                },
            },
            address: true,
            discount: true,
            stripePayments: true,
        },
    });
    if (order && order.stripePayments.length > 0) {
        const sessionId = order.stripePayments.at(-1).stripeCheckoutSessionId;
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'payment_intent', 'payment_intent.payment_method'],
        });
        order.checkoutSession = checkoutSession;
    }
    return order;
}

const verifyOrder = async ({ user }) => {
    const shoppingCart = await getShoppingCartForUser({ user });
    if (shoppingCart.items.length <= 0) return;

    const errors = {};
    console.log({shoppingCart})
    shoppingCart.items.forEach(async (productItem) => {
        const itemResult = await verifyProductItem({ productItem });
        if (!itemResult.ok) {
            errors[productItem.id] = itemResult.error;
        }
    });

    return {
        ok: Object.keys(errors).length === 0,
        errors,
    };
}

const createOrder = async ({ user, discountCode = null }) => {
    const result = await prisma.$transaction(
        async (tx) => {
            const verifyResult = await verifyOrder({ user });
            if (!verifyResult.ok) return verifyResult;

            const shoppingCart = await checkoutShoppingCartForUser({ user });
            console.log({shoppingCart, items: shoppingCart.items})
            const addresses = await prisma.address.findMany({
                where: {
                    userId: user.id,
                }
            });
            console.log({addresses})
            const discount = discountCode ? (
                await prisma.discount.findUnique({
                    where: { code: discountCode }
                })
            ): null;
            console.log({discount})
            const orderNumber = generateRandomString(10).toUpperCase();
            const order = await prisma.order.create({
                data: {
                    orderNumber,
                    status: OrderStatus.OrderPlaced,
                    items: {
                        connect: shoppingCart.items.map(productItem => ({ id: productItem.id })),
                    },
                    // userId: user.id,
                    user: {
                        connect: { id: user.id }
                    },
                    address: {
                        connect: {
                            id: addresses[0].id,
                        }
                    },
                    ...(discount ? {
                        discount: {
                            connect: { id: discount.id },
                        }
                    } : {}),
                },
            });
            console.log({order})

            return {
                ok: true,
                data: order,
            };
        },
        {
            maxWait: 5000, // default: 2000
            timeout: 10000, // default: 5000
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
        }
    )
    
    return result;
};

const makePayment = async ({ order, paymentMethod = null, stripeCheckoutSessionId = null }) => {
    const subtotal = calculateSubtotalPriceForItems({ 
        productItems: order.items,
        discount: order.discount,
    })

    let payment;
    if (stripeCheckoutSessionId) {
        await prisma.stripePayment.create({
            data: {
                order: {
                    connect: { id: order.id},
                },
                stripeCheckoutSessionId,
            }
        });
        payment = await prisma.payment.create({
            data: {
                status: PaymentStatus.Completed,
                amount: subtotal,
                order: {
                    connect: { id: order.id},
                },
            }
        });
    }
    else if (paymentMethod) {
        payment = await prisma.payment.create({
            data: {
                status: PaymentStatus.Completed,
                amount: subtotal,
                order: {
                    connect: { id: order.id},
                },
                paymentMethod: {
                    connect: { id: paymentMethod.id },
                }
            }
        });
    } else {
        payment = await prisma.payment.create({
            data: {
                status: PaymentStatus.Unpaid,
                amount: subtotal,
                order: {
                    connect: { id: order.id},
                },
            }
        });
    }

    // Increase scores for user
    const scores = Math.floor(subtotal / 1000);
    await prisma.user.update({
        where: {
            id: order.user.id,
        },
        data: {
            scores: {
                increment: scores,
            },
        },
    });
    await upgradeCustomerRole({ userId: order.user.id })

    // Decrease stocks
    order.items.forEach(async (productItem) => {
        await prisma.product.update({
            where: { id: productItem.productId },
            data: {
                availableItemCount: {
                    decrement: productItem.quantity,
                },
            },
        })
    });


    return payment;
}

const calculateSubtotalPriceForItems = ({ productItems, discount = null }) => {
    let total = 0;
    productItems.forEach(item => {
        total += item.price * item.quantity;
    });
    const shipping = 50000.0;
    total += shipping;
    if (discount) {
        if (discount.type === DiscountType.percentage) {
            total = total - total * discount.value * 0.01;
        } else {
            total = total - discount.value;
        }
    }

    return total;
}

const processShipment = async ({ order }) => {
    const today = new Date();
    return await prisma.shipment.create({
        data: {
            shipmentDate: today,
            estimatedArrival: new Date(
                today.getTime() + 5*24*60*60*1000 // 5 days from today
            ),
            shipmentMethod: 'Ninja Van',
            order: {
                connect: {
                    id: order.id,
                }
            },
            shipmentFee: 50000,
        }
    });
}

const getManyOrdersByPage = async ({
    // Filters
    user = null,
    statuses = [],
    fromDate = null,
    toDate = null,
    paymentMethods = [],

    // Pagination
    page=1,
    limit=10,
}) => {
    const cashOnlyFilter = {
        payments: {
            every: {
                paymentMethod: {
                    is: null
                },
            },
        },
        stripePayments: {
            none: {},
        }
    }
    const cardOnlyFilter = {
        OR: [
            {
                payments: {
                    none: {
                        paymentMethod: {
                            is: null
                        },
                    },
                },
            },
            {
                stripePayments: {
                    some: {}
                }
            }
        ],
    }
    const searchConditions = {
        ...(user ? {
            userId: user.id,
        } : {}),
        ...(statuses && statuses.length > 0 ? {
            status: {
                in: statuses,
            },
        } : {}),
        ...(paymentMethods && paymentMethods.length === 1 && paymentMethods.includes('card') ? {
            ...cardOnlyFilter,
        } : {}),
        ...(paymentMethods && paymentMethods.length === 1 && paymentMethods.includes('cash') ? {
            ...cashOnlyFilter,
        } : {}),
        // ...(paymentMethods && paymentMethods.length === 1 ? {
        //     payments: {
        //         every: {
        //             paymentMethod: (paymentMethods.includes('card') ? ({
        //                 not: null,
        //             }) : {
        //                 is: null,
        //             }),
        //         },
        //     },
        // } : {}),
        
        // Dates
        AND: [
            (fromDate ? {
                createdAt: {
                    gte: new Date(fromDate),
                },
            } : {}),
            (toDate ? {
                createdAt: {
                    lte: new Date(toDate),
                },
            } : {}),
        ]
    };
    const orders = await prisma.order.findMany({
        where: searchConditions,
        include: {
            payments: {
                include: {
                    paymentMethod: true,
                },
            },
            items: {
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                },
            },
            shipments: true,
            address: true,
            user: true,
            discount: true,
            stripePayments: true,
        },
        orderBy: {
            id: 'desc',
        },
        skip: limit * (page - 1),
        take: limit,
    });

    const numOrders = await prisma.order.count({
        where: searchConditions,
    });

    return {
        data: orders,
        totalPages: Math.ceil(numOrders / limit),
    };
}

const getManyOrdersReadyToShipByPage = async ({
    // Pagination
    page=1,
    limit=10,
}) => {
    const searchConditions = {
        // shipmentLogs: {
        //     none: {
        //         status: {
        //             in: [ShipmentStatus.Cancelled, ShipmentStatus.Shipped, ShipmentStatus.Delivered]
        //         },
        //     },
        //     some: {
        //         status: ShipmentStatus.Pending,
        //     },
        // }
        status: OrderStatus.Processing,
    };
    const orders = await prisma.order.findMany({
        where: searchConditions,
        orderBy: {
            id: 'desc',
        },
        include: {
            payments: {
                include: {
                    paymentMethod: true,
                },
            },
            items: {
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                },
            },
            shipments: true,
            address: true,
            user: true,
            discount: true,
            stripePayments: true,
        },
        skip: limit * (page - 1),
        take: limit,
    });

    const numOrders = await prisma.order.count({
        where: searchConditions,
    });

    // const orderIds = shipments.map(shipment => shipment.orderId);
    // const orders = await prisma.order.findMany({
    //     where: {
    //         id: {
    //             in: orderIds,
    //         }
    //     },
    //     include: {
    //         payments: {
    //             include: {
    //                 paymentMethod: true,
    //             },
    //         },
    //         items: {
    //             include: {
    //                 product: {
    //                     include: {
    //                         images: true,
    //                     },
    //                 },
    //             },
    //         },
    //         shipments: true,
    //         address: true,
    //         user: true,
    //         discount: true,
    //     },
    //     orderBy: {
    //         id: 'desc',
    //     },
    // })

    return {
        data: orders,
        totalPages: Math.ceil(numOrders / limit),
    };
}

const getManyOrdersForUserShippingByPage = async ({
    user,

    // Pagination
    page=1,
    limit=10,
}) => {
    const searchConditions = {
        status: {
            notIn: [OrderStatus.Cancelled, OrderStatus.Delivered, OrderStatus.DeliveryFailed],
        },
        shipments: {
            some: {
                shipmentLogs: {
                    // none: {
                    //     status: {
                    //         in: [ShipmentStatus.Cancelled, ShipmentStatus.Delivered, ShipmentStatus.Failed],
                    //     }
                    // },
                    some: {
                        status: ShipmentStatus.Shipped,
                        doneByUserId: user.id,
                    },
                }
            }
        }
    };
    const orders = await prisma.order.findMany({
        where: searchConditions,
        orderBy: {
            id: 'desc',
        },
        include: {
            payments: {
                include: {
                    paymentMethod: true,
                },
            },
            items: {
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                },
            },
            shipments: true,
            address: true,
            user: true,
            discount: true,
            stripePayments: true,
        },
        skip: limit * (page - 1),
        take: limit,
    });

    const numOrders = await prisma.order.count({
        where: searchConditions,
    });


    return {
        data: orders,
        totalPages: Math.ceil(numOrders / limit),
    };
}

const changeOrderStatus = async ({
    orderNumber,
    doneByUserId,
    orderStatus=null,
    shipmentStatus=null,
    paymentStatus=null,
}) => {
    const order = await prisma.order.findUnique({
        where: {
            orderNumber,
        },
        include: {
            payments: {
                include: {
                    paymentMethod: true,
                },
            },
            shipments: {
                include: {
                    shipmentLogs: true,
                }
            },
            items: {
                include: {
                    product: true,
                }
            },
            stripePayments: true,
        },
    });

    if (orderStatus) {
        await prisma.order.update({
            where: {
                orderNumber,
            },
            data: {
                status: orderStatus,
            },
            
        });
    }
    if (shipmentStatus) {
        let shipment;
        if (order.shipments.length > 0) {
            shipment = order.shipments.at(-1);
            await prisma.shipmentLog.create({
                data: {
                    status: shipmentStatus,
                    shipment: {
                        connect: {
                            id: shipment.id,
                        }
                    },
                    doneByUser: {
                        connect: {
                            id: doneByUserId,
                        }
                    }
                }
            });
        } else {
            shipment = await processShipment({ order });
            await prisma.shipmentLog.create({
                data: {
                    status: shipmentStatus,
                    shipment: {
                        connect: {
                            id: shipment.id,
                        }
                    },
                    doneByUser: {
                        connect: {
                            id: doneByUserId,
                        }
                    }
                }
            });
        }
    }

    if (paymentStatus) {
        let payment;
        if (order.payments.length > 0) {
            payment = order.payments.at(-1);
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: paymentStatus,
                }
            });
        } else {
            const amount = calculateSubtotalPriceForItems({ productItems: order.items, discount: order.discount });
            payment = await prisma.payment.create({
                status: paymentStatus,
                amount,
                order: {
                    connect: { id: order.id },
                },
            })
        }
    }
    
    // Increment the product counts
    if (orderStatus && orderStatus === OrderStatus.Cancelled) {
        order.items.forEach(async (productItem) => {
            await prisma.product.update({
                where: {
                    id: productItem.product.id,
                },
                data: {
                    availableItemCount: {
                        increment: productItem.quantity,
                    }
                }
            });
        });
    }

    return order;
};

export {
    getOrder,
    createOrder,
    makePayment,
    processShipment,
    calculateSubtotalPriceForItems,
    getManyOrdersByPage,
    getManyOrdersReadyToShipByPage,
    getManyOrdersForUserShippingByPage,
    changeOrderStatus,
}