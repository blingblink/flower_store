'use client'

import { useEffect } from 'react'

import {
  Bars3Icon,
  CalendarDaysIcon,
  CreditCardIcon,
  UserCircleIcon,
  // XMarkIcon as XMarkIconMini,
} from '@heroicons/react/20/solid'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import useSWR from 'swr'
import { OrderStatus, ShipmentStatus, DiscountType, PaymentStatus } from '@/constants'
import { formatCurrency } from '@/app/utils';
import { stripe } from '@/lib/stripe'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

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

export default function PlatformOrderDetailsPage({ params }) {
  const { orderNumber } = params;
  const { data: order, isLoading, mutate } = useSWR(`/api/orders/${orderNumber}`, getOrder);

  console.log({order})

  if (isLoading) return <div>Loading...</div>;
  if (!order) return;

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
      discountText = `-${formatCurrency(discount.value)}`;
    }
  }

  const actionMapping = {
    'Created': 'tạo',
    [ShipmentStatus.Pending]: 'duyệt',
    [ShipmentStatus.Shipped]: 'nhận giao',
    [ShipmentStatus.Delivered]: 'đã giao',
    [ShipmentStatus.Cancelled]: 'đã huỷ',
    [ShipmentStatus.Failed]: 'đã giao không thành công',
  }
  const shipmentLogs = order.shipments.length > 0 ? order.shipments.at(-1).shipmentLogs : [];
  const activityLogs = [
    {
      id: 0,
      status: 'Created',
      doneByUser: {
        name: 'Khách hàng'
      },
      createdAt: order.createdAt,
    },
    ...shipmentLogs,
  ].map(item => ({
    ...item,
    action: actionMapping[item.status],
  }));

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

  const onApproveOrder = async () => {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber,
        orderStatus: OrderStatus.Processing,
        shipmentStatus: ShipmentStatus.Pending,
      }),
    });
    mutate();
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

  return (
    <>
      <main>
        {/* Page title & actions */}
        <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-medium leading-6 text-gray-900 sm:truncate">Chi tiết đơn hàng</h1>
          </div>
          <div className="mt-4 flex sm:ml-4 sm:mt-0">
            {![OrderStatus.Cancelled, OrderStatus.Delivered, OrderStatus.DeliveryFailed].includes(order.status) && (
              <button
                type="button"
                className="sm:order-0 order-1 ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-0"
                onClick={onCancelOrder}
              >
                Huỷ đơn
              </button>
            )}
            {order.status === OrderStatus.OrderPlaced && (
              <button
                type="button"
                className="order-0 inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:order-1 sm:ml-3"
                onClick={onApproveOrder}
              >
                Duyệt
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {/* Invoice summary */}
            <div className="lg:col-start-3 lg:row-end-1">
              <h2 className="sr-only">Summary</h2>
              <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
                <dl className="flex flex-wrap">
                  <div className="flex-auto pl-6 pt-6">
                    <dt className="text-sm font-semibold leading-6 text-gray-900">Tổng tiền</dt>
                    <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">{formatCurrency(total)}</dd>
                  </div>
                  <div className="flex-none self-end px-6 pt-4">
                    <dt className="sr-only">Status</dt>
                    <dd className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20">
                      {paymentStatus}
                    </dd>
                  </div>
                  <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
                    <dt className="flex-none">
                      <span className="sr-only">Role</span>
                      <UserCircleIcon className="h-6 w-5 text-gray-400" aria-hidden="true" />
                    </dt>
                    <dd className="text-sm font-medium leading-6 text-gray-900">{order.user.role}</dd>
                  </div>
                  {lastPayment && (
                    <>
                      <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                        <dt className="flex-none">
                          <span className="sr-only">Paid date</span>
                          <CalendarDaysIcon className="h-6 w-5 text-gray-400" aria-hidden="true" />
                        </dt>
                        <dd className="text-sm leading-6 text-gray-500">
                          <time dateTime="2023-01-31">{(new Date(lastPayment.createdAt)).toLocaleDateString()}</time>
                        </dd>
                      </div>
                      <div className="mt-4 flex w-full flex-none gap-x-4 px-6 pb-6">
                        <dt className="flex-none">
                          <span className="sr-only">Status</span>
                          <CreditCardIcon className="h-6 w-5 text-gray-400" aria-hidden="true" />
                        </dt>
                        <dd className="text-sm leading-6 text-gray-500">
                          {lastPayment.status === PaymentStatus.Completed ? (
                            `Thanh toán bằng ${cardNumber ? `thẻ ${cardNumber}` : 'tiền mặt'}`
                          ) : (
                            lastPayment.status
                          )}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
                {/* <div className="mt-6 border-t border-gray-900/5 px-6 py-6">
                  <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
                    Download receipt <span aria-hidden="true">&rarr;</span>
                  </a>
                </div> */}
              </div>
            </div>

            {/* Invoice */}
            <div className="-mx-4 px-4 py-6 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-10 xl:pb-20 xl:pt-6">
              <h2 className="text-base font-semibold leading-6 text-gray-900">Đơn hàng</h2>
              <dl className="mt-6 grid grid-cols-1 text-sm leading-6 sm:grid-cols-2">
                <div className="sm:pr-4">
                  <dt className="inline text-gray-500">Mã đơn hàng</dt>{' '}
                  <dd className="inline text-gray-700">
                    <time dateTime="2023-23-01">{order.orderNumber}</time>
                  </dd>
                </div>
                <div className="mt-2 sm:mt-0 sm:pl-4">
                  <dt className="inline text-gray-500">Đặt vào</dt>{' '}
                  <dd className="inline text-gray-700">
                    <time dateTime="2023-31-01">January 31, 2023</time>
                  </dd>
                </div>
                <div className="sm:pr-4">
                  <dt className="inline text-gray-500">Trạng thái</dt>{' '}
                  <dd className="inline text-gray-700">
                    {order.status}
                  </dd>
                </div>
                <div className="sm:pr-4">

                </div>
                <div className="mt-6 border-t border-gray-900/5 pt-6 sm:pr-4">
                  <dt className="font-semibold text-gray-900">Địa chỉ giao hàng</dt>
                  <dd className="mt-2 text-gray-500">
                    <span className="font-medium text-gray-900">{order.user.name}</span>
                    <br />
                    {order.address.streetAddress}
                  </dd>
                </div>
                <div className="mt-6 border-t border-gray-900/5 pt-6 sm:pr-4">
                  
                </div>
                {/* <div className="mt-8 sm:mt-6 sm:border-t sm:border-gray-900/5 sm:pl-4 sm:pt-6">
                  <dt className="font-semibold text-gray-900">To</dt>
                  <dd className="mt-2 text-gray-500">
                    <span className="font-medium text-gray-900">Tuple, Inc</span>
                    <br />
                    886 Walter Street
                    <br />
                    New York, NY 12345
                  </dd>
                </div> */}
              </dl>
              <table className="mt-16 w-full whitespace-nowrap text-left text-sm leading-6">
                <colgroup>
                  <col className="w-full" />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead className="border-b border-gray-200 text-gray-900">
                  <tr>
                    <th scope="col" className="px-0 py-3 font-semibold">
                      Sản phẩm
                    </th>
                    <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                      Số lượng
                    </th>
                    <th scope="col" className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">
                      Giá lẻ
                    </th>
                    <th scope="col" className="py-3 pl-8 pr-0 text-right font-semibold">
                      Giá sản phẩm
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="max-w-0 px-0 py-5 align-top">
                        <div className="truncate font-medium text-gray-900">{item.product.name}</div>
                        <div className="truncate text-gray-500">{item.product.description}</div>
                      </td>
                      <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell">
                        {item.quantity}
                      </td>
                      <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700">
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" className="px-0 pb-0 pt-6 font-normal text-gray-700 sm:hidden">
                      Tổng tiền hàng
                    </th>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden px-0 pb-0 pt-6 text-right font-normal text-gray-700 sm:table-cell"
                    >
                      Tổng tiền hàng
                    </th>
                    <td className="pb-0 pl-8 pr-0 pt-6 text-right tabular-nums text-gray-900">{formatCurrency(subtotal)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="pt-4 font-normal text-gray-700 sm:hidden">
                      Phí vận chuyển
                    </th>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pt-4 text-right font-normal text-gray-700 sm:table-cell"
                    >
                      Phí vận chuyển
                    </th>
                    <td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900">{formatCurrency(shipping)}</td>
                  </tr>
                  {discountText && (
                    <tr>
                      <th scope="row" className="pt-4 font-normal text-gray-700 sm:hidden">
                        Mã giảm giá
                      </th>
                      <th
                        scope="row"
                        colSpan={3}
                        className="hidden pt-4 text-right font-normal text-gray-700 sm:table-cell"
                      >
                        Mã giảm giá
                      </th>
                      <td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900">
                        {discountText}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <th scope="row" className="pt-4 font-semibold text-gray-900 sm:hidden">
                      Thành tiền
                    </th>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pt-4 text-right font-semibold text-gray-900 sm:table-cell"
                    >
                      Thành tiền
                    </th>
                    <td className="pb-0 pl-8 pr-0 pt-4 text-right font-semibold tabular-nums text-gray-900">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="lg:col-start-3">
              {/* Activity feed */}
              <h2 className="text-sm font-semibold leading-6 text-gray-900">Activity</h2>
              <ul role="list" className="mt-6 space-y-6">
                {activityLogs.map((activityItem, activityItemIdx) => (
                  <li key={activityItem.id} className="relative flex gap-x-4">
                    <div
                      className={classNames(
                        activityItemIdx === activityLogs.length - 1 ? 'h-6' : '-bottom-6',
                        'absolute left-0 top-0 flex w-6 justify-center'
                      )}
                    >
                      <div className="w-px bg-gray-200" />
                    </div>
                    <>
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                          {activityItem.status === ShipmentStatus.Delivered ? (
                            <CheckCircleIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                          ) : (
                            <>
                              {activityItem.status === ShipmentStatus.Cancelled ? (
                                <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                              ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                              )}
                            </>
                          )}
                        </div>
                        <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                          <span className="font-medium text-gray-900">{activityItem.doneByUser.name}</span>{' '}
                          {activityItem.action} đơn hàng.
                        </p>
                        <time
                          dateTime={activityItem.createdAt}
                          className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                        >
                          {(new Date(activityItem.createdAt)).toLocaleDateString()}
                        </time>
                      </>
                  </li>
                ))}
              </ul>

              {/* New comment form */}
              {/* <div className="mt-6 flex gap-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                  className="h-6 w-6 flex-none rounded-full bg-gray-50"
                />
                <form action="#" className="relative flex-auto">
                  <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                    <label htmlFor="comment" className="sr-only">
                      Add your comment
                    </label>
                    <textarea
                      rows={2}
                      name="comment"
                      id="comment"
                      className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Add your comment..."
                      defaultValue={''}
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                    <div className="flex items-center space-x-5">
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                        >
                          <PaperClipIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Attach a file</span>
                        </button>
                      </div>
                      <div className="flex items-center">
                        <Listbox value={selected} onChange={setSelected}>
                          {({ open }) => (
                            <>
                              <Listbox.Label className="sr-only">Your mood</Listbox.Label>
                              <div className="relative">
                                <Listbox.Button className="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                                  <span className="flex items-center justify-center">
                                    {selected.value === null ? (
                                      <span>
                                        <FaceSmileIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                                        <span className="sr-only">Add your mood</span>
                                      </span>
                                    ) : (
                                      <span>
                                        <span
                                          className={classNames(
                                            selected.bgColor,
                                            'flex h-8 w-8 items-center justify-center rounded-full'
                                          )}
                                        >
                                          <selected.icon
                                            className="h-5 w-5 flex-shrink-0 text-white"
                                            aria-hidden="true"
                                          />
                                        </span>
                                        <span className="sr-only">{selected.name}</span>
                                      </span>
                                    )}
                                  </span>
                                </Listbox.Button>

                                <Transition
                                  show={open}
                                  as={Fragment}
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <Listbox.Options className="absolute z-10 -ml-6 mt-1 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm">
                                    {moods.map((mood) => (
                                      <Listbox.Option
                                        key={mood.value}
                                        className={({ active }) =>
                                          classNames(
                                            active ? 'bg-gray-100' : 'bg-white',
                                            'relative cursor-default select-none px-3 py-2'
                                          )
                                        }
                                        value={mood}
                                      >
                                        <div className="flex items-center">
                                          <div
                                            className={classNames(
                                              mood.bgColor,
                                              'flex h-8 w-8 items-center justify-center rounded-full'
                                            )}
                                          >
                                            <mood.icon
                                              className={classNames(mood.iconColor, 'h-5 w-5 flex-shrink-0')}
                                              aria-hidden="true"
                                            />
                                          </div>
                                          <span className="ml-3 block truncate font-medium">{mood.name}</span>
                                        </div>
                                      </Listbox.Option>
                                    ))}
                                  </Listbox.Options>
                                </Transition>
                              </div>
                            </>
                          )}
                        </Listbox>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Comment
                    </button>
                  </div>
                </form>
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
