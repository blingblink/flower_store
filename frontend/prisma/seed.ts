// @ts-nocheck

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { faker } from '@faker-js/faker/locale/vi';
import { UserRoles, DiscountType } from "../constants";
import { generateRandomString } from '../app/utils';
import { OrderStatus, PaymentStatus, ShipmentStatus, UserRoles, Categories } from "../constants";
import { calculateSubtotalPriceForItems } from "../services/orderService";
import { upgradeCustomerRole } from "../services/userService";


const prisma = new PrismaClient();

const NUM_USERS = 20;
const NUM_EMPLOYEES = 5

function randomIntFromInterval(min: any, max: any) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomItem(items: any, except: any = []) {
  const filteredItems = items.filter((item: any) => !except.includes(item));
  return filteredItems[Math.floor(Math.random() * filteredItems.length)];
}

const createUsers = async () => {
  const password: any = await hash("123", 12);
  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      name: "Admin",
      role: UserRoles.Admin,
      password,
      phone: `0${faker.number.int({ min: 100000000, max: 999999999 }).toString()}`,
      addresses: {
        createMany: {
          data: [
            {
              streetAddress: faker.location.streetAddress(),
            }
          ],
        }
      },
      paymentMethods: {
        createMany: {
          data: [
            {
              nameOnCard: 'Mylo Truong',
              cardNumber: '4242424242424242',
              expirationMonth: 12,
              expirationYear: 9999,
              cvc: '123',
              isDefault: true,
            },
          ],
        },
      },
    },
  });
  await prisma.user.upsert({
    where: { email: "user@user.com" },
    update: {},
    create: {
      email: "user@user.com",
      name: "Mylo Truong",
      role: UserRoles.User,
      scores: faker.number.int({ min: 800, max: 6000 }),
      phone: `0${faker.number.int({ min: 100000000, max: 999999999 }).toString()}`,
      password,
      addresses: {
        createMany: {
          data: [
            {
              streetAddress: faker.location.streetAddress(),
            }
          ],
        }
      },
      paymentMethods: {
        createMany: {
          data: [
            {
              nameOnCard: 'Mylo Truong',
              cardNumber: '4242424242424242',
              expirationMonth: 12,
              expirationYear: 9999,
              cvc: '123',
              isDefault: true,
            },
          ],
        },
      },
    },
  });

  for (const i = 0; i < NUM_USERS; i++) {
    await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: UserRoles.User,
        image: faker.image.avatarLegacy(),
        password,
        scores: faker.number.int({ min: 800, max: 6000 }),
        phone: `0${faker.number.int({ min: 100000000, max: 999999999 }).toString()}`,
        addresses: {
          createMany: {
            data: [
              {
                streetAddress: faker.location.streetAddress(),
              }
            ],
          }
        },
        paymentMethods: {
          createMany: {
            data: [
              {
                nameOnCard: 'Mylo Truong',
                cardNumber: '4242424242424242',
                expirationMonth: 12,
                expirationYear: 9999,
                cvc: '123',
                isDefault: true,
              },
            ],
          },
        },
      },
    });
  }

  for (const i = 0; i < NUM_EMPLOYEES; i++) {
    await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: UserRoles.Employee,
        image: faker.image.avatarLegacy(),
        password,
        phone: `0${faker.number.int({ min: 100000000, max: 999999999 }).toString()}`,
        addresses: {
          createMany: {
            data: [
              {
                streetAddress: faker.location.streetAddress(),
              }
            ],
          }
        },
        paymentMethods: {
          createMany: {
            data: [
              {
                nameOnCard: 'Mylo Truong',
                cardNumber: '4242424242424242',
                expirationMonth: 12,
                expirationYear: 9999,
                cvc: '123',
                isDefault: true,
              },
            ],
          },
        },
      },
    });
  }
}

const createProducts = async () => {
  await prisma.category.createMany({
    data: Categories.map((category: any) => ({ name: category.name })),
  });
  const createdCategories = await prisma.category.findMany();
  const categories = createdCategories.map((category: any, index: any) => {
    return {
      ...category,
      ...Categories[index],
    }
  });

  // Products
  // let products: any = [];
  // categories.forEach((category: any) => {
  const createdUsers = await prisma.user.findMany({
    where: {
      role: UserRoles.User,
    },
    select: {
      id: true,
    }
  });
  for (const category: any of categories) {
    const numProducts = randomIntFromInterval(5, 40);
    for (const i = 0; i < numProducts; i++) {
      const reviews = [];
      for (const j = 0; j < randomIntFromInterval(5, 150); j++) {
        reviews.push({
          rating: randomIntFromInterval(1, 5),
          review: faker.commerce.productDescription(),
          userId: randomItem(createdUsers).id,
          createdAt: faker.date.between({
            from: '2022-01-01',
            to: '2023-09-30',
          }),
        });
      }
      const images = [];
      for (const j = 0; j < 5; j++) {
        images.push({
          src: faker.image.urlLoremFlickr({
            width: 640,
            height: 640,
            category: category.en,
          }),
          createdAt: faker.date.between({
            from: '2022-01-01',
            to: '2023-09-30',
          }),
        });
      }

      await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          // description: faker.commerce.productDescription(),
          description: faker.lorem.paragraphs({ min: 5, max: 8 }, '<br/>\n'),
          features: faker.lorem.sentences({min: 4, max: 7}, '<br/>'),
          price: randomIntFromInterval(50, 1500) * 1000,
          views: randomIntFromInterval(0, 200),
          availableItemCount: randomIntFromInterval(0, 20),
          // categoryId: category.id,
          category: {
            connect: {
              id: category.id,
            }
          },
          productReviews: {
            createMany: {
              data: reviews,
            }
          },
          images: {
            createMany: {
              data: images,
            }
          }
        }
      });

      // await prisma.product.update({
      //   where: {
      //     id: product.id,
      //   },
      //   data: {
      //     productReviews: {
      //       createMany: {
      //         data: reviews,
      //       }
      //     }
      //   }
      // })
    }
  }
  // await prisma.product.createMany({
  //   data: products,
  // });
  // return await prisma.product.findMany({
  //   select: {
  //     id: true,
  //   }
  // });
}

const createOrder = async ({ products, guestUser, orderStatus = OrderStatus.Delivered }) => {
  const productItems = [];
  for (const j = 0; j < randomIntFromInterval(1, 3); j++) {
    const newProduct = randomItem(products, productItems);
    productItems.push({
      quantity: randomIntFromInterval(1, 5),
      price: newProduct.price,
      productId: newProduct.id,
    })
  }
  let subtotalPrice = calculateSubtotalPriceForItems({ productItems });
  const shipmentDate = faker.date.between({
    from: '2022-01-01',
    to: '2023-09-30',
  });
  const shippedDate = new Date(shipmentDate.getTime() + 2*24*60*60*1000);
  const arrivalDate = new Date(shipmentDate.getTime() + 5*24*60*60*1000);
  const defaultPaymentMethod = guestUser.paymentMethods.find(method => method.isDefault);

  // Discount
  const hasDiscount = randomItem([true, false]);
  let discount;
  if (hasDiscount) {
    const discounts = await prisma.discount.findMany();
    discount = randomItem(discounts);
    
    if (discount.type === DiscountType.percentage) {
      subtotalPrice = subtotalPrice - subtotalPrice * discount.value * 0.01;
    } else {
      subtotalPrice = subtotalPrice - discount.value;
    }
  }

  const order = await prisma.order.create({
    data: {
      orderNumber: generateRandomString(10).toUpperCase(),
      status: orderStatus,
      createdAt: shipmentDate,
      // userId: guestUser.id,
      user: {
        connect: {id: guestUser.id},
      },
      ...(discount ? {
        discount: {
          connect: { id: discount.id },
        },
      } : {}),

      payments: {
        createMany: {
          data: [{
            amount: subtotalPrice,
            status: PaymentStatus.Completed,
            createdAt: shipmentDate,

            // If null, it is cash payment
            paymentMethodId: randomItem([defaultPaymentMethod.id, null]),
          }],
        }
      },
      items: {
        createMany: {
          data: productItems,
        },
      },
      address: {
        connect: { id: guestUser.addresses[0].id},
      },
    }
  });

  // Add shipment logs
  const adminUser = await prisma.user.findUnique({
    where: {
      email: "admin@admin.com"
    }
  });

  const shipmentLogsMapping = {
    [OrderStatus.Delivered]: [
      {
        status: ShipmentStatus.Pending,
        createdAt: shipmentDate,
        doneByUserId: adminUser.id,
      },
      {
        status: ShipmentStatus.Shipped,
        createdAt: shippedDate,
        doneByUserId: adminUser.id,
      },
      {
        status: ShipmentStatus.Delivered,
        createdAt: arrivalDate,
        doneByUserId: adminUser.id,
      },
    ],
    [OrderStatus.OrderPlaced]: [],
    [OrderStatus.Processing]: [
      {
        status: ShipmentStatus.Pending,
        createdAt: shipmentDate,
        doneByUserId: adminUser.id,
      },
    ],
    [OrderStatus.Shipped]: [
      {
        status: ShipmentStatus.Pending,
        createdAt: shipmentDate,
        doneByUserId: adminUser.id,
      },
      {
        status: ShipmentStatus.Shipped,
        createdAt: shippedDate,
        doneByUserId: adminUser.id,
      },
    ],
    [OrderStatus.Cancelled]: [
      {
        status: ShipmentStatus.Cancelled,
        createdAt: shipmentDate,
        doneByUserId: adminUser.id,
      },
    ],
    [OrderStatus.DeliveryFailed]: [
      {
        status: ShipmentStatus.Pending,
        createdAt: shipmentDate,
        doneByUserId: adminUser.id,
      },
      {
        status: ShipmentStatus.Shipped,
        createdAt: shippedDate,
        doneByUserId: adminUser.id,
      },
      {
        status: ShipmentStatus.Failed,
        createdAt: arrivalDate,
        doneByUserId: adminUser.id,
      },
    ],
  }
  await prisma.shipment.create({
    data: {
      shipmentDate,
      estimatedArrival: arrivalDate,
      arrivalDate,
      shipmentMethod: 'Ninja Van',
      shipmentFee: 0,
      createdAt: shipmentDate,
      order: {
        connect: { id: order.id },
      },
      shipmentLogs: {
        createMany: {
          data: shipmentLogsMapping[orderStatus],
        },
      },
    }
  })
}

const createOrders = async ({ guestUser, products }) => {
  const orderStatuses = Object.values(OrderStatus);
  for (const i = 0; i < randomIntFromInterval(60, 100); i++) {
    await createOrder({ products, guestUser, orderStatus: randomItem(orderStatuses) })
  }
}

const createDiscounts = async () => {
  const discounts = [];
  const roles = [null, UserRoles.SilverCustomer, UserRoles.GoldCustomer, UserRoles.PlatinumCustomer];

  const discountTypes = [DiscountType.scalar, DiscountType.percentage]
  for (const i = 0; i < randomIntFromInterval(10, 20); i++) {
    let discountType = randomItem(discountTypes);
    const hasDateRange = randomItem([true, false]);
    let discountFrom;
    let discountTo;
    if (hasDateRange) {
      discountFrom = faker.date.between({
        from: '2022-01-01',
        to: '2023-09-30',
      });
      discountTo = new Date(discountFrom.getTime() + 30*24*60*60*1000);
    }

    if (discountType === DiscountType.scalar) {
      discounts.push({
        code: generateRandomString(6).toUpperCase(),
        type: discountType,
        value: randomIntFromInterval(10, 50) * 100,
        userRole: randomItem(roles),
        ...(hasDateRange ? {
          fromDate: discountFrom,
          toDate: discountTo,
        } : {}),
      });
    } else {
      discounts.push({
        code: generateRandomString(6).toUpperCase(),
        type: discountType,
        value: randomIntFromInterval(5, 10),
        userRole: randomItem(roles),
        ...(hasDateRange ? {
          fromDate: discountFrom,
          toDate: discountTo,
        } : {}),
      });
    }
  }

  await prisma.discount.createMany({
    data: discounts,
  });
}

const upgradeAllUsersRoles = async () => {
  const users = await prisma.user.findMany();
  for (const user: any of users) {
    await upgradeCustomerRole({ userId: user.id });
  }
}

async function main() {
  const users = await createUsers();
  const guestUser = await prisma.user.findUnique({
    where: { email: "user@user.com" },
    include: {
      addresses: true,
      paymentMethods: true,
    }
  })
  await createDiscounts();
  await createProducts();
  
  const products = await prisma.product.findMany();
  await createOrders({ guestUser, products });
  await upgradeAllUsersRoles();
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });