import prisma from '../app/db';
import { OrderStatus, PaymentStatus } from '@/constants';

const getRevenues = async ({
    statuses = [],
    fromDate = null,
    toDate = null,
}) => {
  const searchConditions = {
    ...(statuses && statuses.length > 0 ? {
      status: {
        in: statuses,
      },
    } : {
      NOT: {
        status: {
          notIn: [OrderStatus.Cancelled, OrderStatus.DeliveryFailed],
        }
      },
    }),
    payments: {
      some: {
        status: PaymentStatus.Completed,
      }
    },
    
    // Dates
    ...(fromDate ? {
      createdAt: {
          gte: new Date(fromDate),
      },
    } : {}),
    ...(toDate ? {
      createdAt: {
          lte: new Date(toDate),
      },
    } : {}),
  }
  // console.log(JSON.stringify({searchConditions}, null, 4));

  const cashOrders = await prisma.order.findMany({
    // by: ['status'],
    where: {
      ...searchConditions,
      payments: {
        some: {
          paymentMethod: {
            is: null,
          }
        },
      },
      stripePayments: {
        none: {},
      },
    },
    include: {
      payments: true,
    }
  });
  const cashPaymentIds = cashOrders.map(order => {
    const lastPayment = order.payments.at(-1);
    if (lastPayment) return lastPayment.id;
    return;
  }).filter(id => !!id);

  const revenueCash = await prisma.payment.groupBy({
    by: ['status'],
    where: {
      id: {
        in: cashPaymentIds,
      }
    },
    _sum: {
      amount: true,
    }
  });

  const cashAmount = revenueCash.length > 0 ? revenueCash[0]._sum.amount : 0;
  
  const cardOrders = await prisma.order.findMany({
    where: {
      ...searchConditions,
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
    },
    include: {
      payments: true,
    }
  });

  const cardPaymentIds = cardOrders.map(order => {
    const lastPayment = order.payments.at(-1);
    if (lastPayment) return lastPayment.id;
    return;
  }).filter(id => !!id);

  const revenueCard = await prisma.payment.groupBy({
    by: ['status'],
    where: {
      id: {
        in: cardPaymentIds,
      }
    },
    _sum: {
      amount: true,
    }
  });
  const cardAmount = revenueCard.length > 0 ? revenueCard[0]._sum.amount : 0;

  // console.log(JSON.stringify({revenueCard, revenueCash}, null, 4));
  return [
    {
      name: 'Tổng doanh thu',
      value: cashAmount + cardAmount,
    },
    {
      name: 'Doanh thu thanh toán thẻ',
      value: cardAmount,
    },
    {
      name: 'Doanh thu thanh toán tiền mặt',
      value: cashAmount,
    },
    
  ]
}


export {
  getRevenues
};