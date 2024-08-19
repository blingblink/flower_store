'use client'

import { useEffect } from "react";
import useSWR from "swr";
import classNames from 'classnames'
import Link from 'next/link';
import { ShipmentStatus, DiscountType, OrderStatus, PaymentStatus } from '@/constants'
import { formatCurrency } from '@/app/utils';
import { stripe } from '@/lib/stripe'

async function getOrder(url) {
  const res = await fetch(url);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
 
  return res.json();
}

export default function OrderDetailsPage({ params }) {
  const { orderNumber } = params;
  const { data: order, isLoading, mutate } = useSWR(`/api/orders/${orderNumber}`, getOrder);
  
  console.log({order})

  if (isLoading) return <div>Loading...</div>;
  if (!order) return;

  const onCancelOrder = async () => {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber,
        orderStatus: OrderStatus.Cancelled,
        shipmentStatus: ShipmentStatus.Cancelled,
      }),
    });
    mutate();
  }

  const createdDate = new Date(order.createdAt);
  let lastShipmentLog;
  if (order.shipments.length > 0 && order.shipments.at(-1).shipmentLogs.length > 0) {
    lastShipmentLog = order.shipments.at(-1).shipmentLogs.at(-1);
  }
  const lastLogDatetime = new Date(
    lastShipmentLog ? lastShipmentLog.createdAt : order.createdAt
  );
  let orderStep = 0;
  if (lastShipmentLog){
    switch(lastShipmentLog.status) {
      case ShipmentStatus.Pending:
        orderStep = 1;
        break;
      case ShipmentStatus.Shipped:
        orderStep = 2;
        break;
      case ShipmentStatus.Delivered:
        orderStep = 4;
        break;
      case ShipmentStatus.Failed:
        orderStep = 4;
        break;
    }
  }

  const lastPayment = order.payments.at(-1);
  let cardNumber;
  const paymentIntent = order?.checkoutSession?.payment_intent;
  let paymentStatus;
  if (paymentIntent) {
    if (paymentIntent.status === 'succeeded') {
      paymentStatus = 'Đã thanh toán';
    } else paymentStatus = 'Chưa thanh toán';
    cardNumber = paymentIntent?.payment_method?.card?.last4;
  }
  else {
    paymentStatus = lastPayment?.status || 'Chưa thanh toán';
    cardNumber = lastPayment?.paymentMethod?.cardNumber.substr(lastPayment?.paymentMethod?.cardNumber.length - 4);
  }

  let subtotal = 0;
  let shipping = 0;
  let total = 0;

  order.items.forEach(productItem => {
    subtotal += productItem.quantity * productItem.price;
  });
  shipping = 50000.0;
  total = subtotal + shipping;
  const discount = order.discount;
  let discountText;
  if (discount) {
    if (discount.type === DiscountType.percentage) {
      total = total - total * discount.value * 0.01;
      discountText = `-${discount.value}%`;
    } else {
      total = total - discount.value;
      discountText = `-${discount.value} VND`;
    }
  }

  return (
    <main className="bg-white px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Chi tiết đơn hàng</h1>
          <div className="mt-4 flex sm:ml-4 sm:mt-0">
            {order.status === OrderStatus.OrderPlaced && (
              <button
                type="button"
                className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-0"
                onClick={onCancelOrder}
              >
                Huỷ đơn
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 border-b border-gray-200 pb-5 text-sm sm:flex sm:justify-between">
          <dl className="flex">
            <dt className="text-gray-500">Mã đơn hàng:</dt>
            <dd className="font-medium text-gray-900 mx-1">{order.orderNumber}</dd>
            <dt>
              <span className="sr-only">Date</span>
              <span className="mx-2 text-gray-400" aria-hidden="true">
                &middot;
              </span>
            </dt>
            <dd className="font-medium text-gray-900">
              <time dateTime="2021-03-22">
                {`${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString()}`}
              </time>
            </dd>
          </dl>
          {/* <div className="mt-4 sm:mt-0">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              View invoice
              <span aria-hidden="true"> &rarr;</span>
            </a>
          </div> */}
        </div>

        {/* Progress bar */}
        <div className="border-t border-gray-200 py-6 lg:py-8">
          <h4 className="sr-only">Status</h4>
          <p className="text-sm font-medium text-gray-900">
            {order.status} vào lúc <time dateTime={lastLogDatetime}>
              {`${lastLogDatetime.toLocaleDateString()} ${lastLogDatetime.toLocaleTimeString()}`}
            </time>
          </p>
          <div className="mt-6" aria-hidden="true">
            <div className="overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-indigo-600"
                style={{ width: `calc((${orderStep} * 2 + 1) / 8 * 100%)` }}
              />
            </div>
            <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
              <div className={classNames(!lastShipmentLog && 'text-indigo-600')}>Chờ xác nhận</div>
              <div className={classNames(lastShipmentLog && lastShipmentLog.status === ShipmentStatus.Pending ? 'text-indigo-600' : '', 'text-center')}>
                Chờ lấy hàng
              </div>
              <div className={classNames(lastShipmentLog && lastShipmentLog.status === ShipmentStatus.Shipped ? 'text-indigo-600' : '', 'text-center')}>
                Đang giao hàng
              </div>
              {lastShipmentLog && lastShipmentLog.status === ShipmentStatus.Failed ? (
                <div className={classNames(lastShipmentLog && lastShipmentLog.status === ShipmentStatus.Failed ? 'text-red-600' : '', 'text-right')}>
                  Giao hàng thất bại
                </div>
              ) : (
                <div className={classNames(lastShipmentLog && lastShipmentLog.status === ShipmentStatus.Delivered ? 'text-indigo-600' : '', 'text-right')}>
                  Đã giao hàng
                </div>
              )}
            </div>
          </div>
        </div>


        <section aria-labelledby="order-heading" className="border-t border-gray-200">
          <h2 id="order-heading" className="sr-only">
            Your order
          </h2>

          <h3 className="sr-only">Items</h3>
          {order.items.map((productItem) => (
            <div key={productItem.id} className="flex space-x-6 border-b border-gray-200 py-10">
              <img
                src={productItem.product.images[0].src}
                alt={productItem.product.name}
                className="h-20 w-20 flex-none rounded-lg bg-gray-100 object-cover object-center sm:h-40 sm:w-40"
              />
              <div className="flex flex-auto flex-col">
                <div>
                  <h4 className="font-medium text-gray-900">
                    <Link href={`/products/${productItem.product.id}`}>{productItem.product.name}</Link>
                  </h4>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{productItem.product.description}</p>
                </div>
                <div className="mt-6 flex flex-1 items-end">
                  <dl className="flex space-x-4 divide-x divide-gray-200 text-sm sm:space-x-6">
                    <div className="flex">
                      <dt className="font-medium text-gray-900">Số lượng</dt>
                      <dd className="ml-2 text-gray-700">{productItem.quantity}</dd>
                    </div>
                    <div className="flex pl-4 sm:pl-6">
                      <dt className="font-medium text-gray-900">Giá tiền</dt>
                      <dd className="ml-2 text-gray-700">{formatCurrency(productItem.price)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          ))}

          <div className="sm:ml-40 sm:pl-6">
            <h3 className="sr-only">Thông tin khách hàng</h3>

            <dl className="grid grid-cols-2 gap-x-6 py-10 text-sm">
              <div>
                <dt className="font-medium text-gray-900">Địa chỉ giao hàng</dt>
                <dd className="mt-2 text-gray-700">
                  <address className="not-italic">
                    <span className="block">{order.user.name}</span>
                    <span className="block">{order.address.streetAddress}</span>
                    {/* <span className="block">Toronto, ON N3Y 4H8</span> */}
                  </address>
                </dd>
              </div>
              {/* <div>
                <dt className="font-medium text-gray-900">Billing address</dt>
                <dd className="mt-2 text-gray-700">
                  <address className="not-italic">
                    <span className="block">Kristin Watson</span>
                    <span className="block">7363 Cynthia Pass</span>
                    <span className="block">Toronto, ON N3Y 4H8</span>
                  </address>
                </dd>
              </div> */}
            </dl>

            <h4 className="sr-only">Thanh toán</h4>
            <dl className="grid grid-cols-2 gap-x-6 border-t border-gray-200 py-10 text-sm">
              <div>
                <dt className="font-medium text-gray-900">Phương thức thanh toán</dt>
                {cardNumber ? (
                  <dd className="mt-2 text-gray-700">
                    {/* <p>Apple Pay</p> */}
                    <p>Thẻ</p>
                    <p>
                      <span aria-hidden="true">••••</span>
                      <span className="sr-only">Ending in </span>{cardNumber}
                    </p>
                  </dd>
                ) : (
                  <dd className="mt-2 text-gray-700">
                    <p>{paymentStatus}</p>
                  </dd>
                )}
              </div>
              <div>
                <dt className="font-medium text-gray-900">Đơn vị vận chuyển</dt>
                <dd className="mt-2 text-gray-700">
                  <p>NinjaVan</p>
                  {lastShipmentLog && lastShipmentLog.status !== ShipmentStatus.Delivered && (
                    <p>Takes up to 3 working days</p>
                  )}
                </dd>
              </div>
            </dl>

            <h3 className="sr-only gray-200">Summary</h3>

            <dl className="space-y-6 border-t border-gray-200 pt-10 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">Tổng tiền hàng</dt>
                <dd className="text-gray-700">{subtotal}</dd>
              </div>
              {discount && (
                <div className="flex justify-between">
                  <dt className="flex font-medium text-gray-900">
                    Mã giảm giá
                    <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">{discount.code}</span>
                  </dt>
                  <dd className="text-gray-700">{discountText}</dd>
                </div>
              )}
              
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">Phí vận chuyển</dt>
                <dd className="text-gray-700">{shipping}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">Thành tiền</dt>
                <dd className="text-gray-900">{total}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  )
}
