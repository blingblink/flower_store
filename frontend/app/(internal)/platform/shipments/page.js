'use client'

import PaginatedListPage from '@/components/PaginatedListPage';
import { OrderStatus, ShipmentStatus, PaymentStatus } from '@/constants';

const columns = [
  {
    key: 'orderNumber',
    label: 'Mã đơn hàng',
    type: 'text',
    href: (order) => `/platform/orders/${order.orderNumber}`,
  },
  {
    key: 'status',
    label: 'Trạng thái',
    type: 'text',
  },
  {
    key: 'user',
    label: 'Khách hàng',
    type: 'text',
    displayConverter: (user) => user.name,
  },
  {
    key: 'address',
    label: 'Địa chỉ',
    type: 'text',
    displayConverter: (address) => address.streetAddress,
  },
  {
    key: 'createdAt',
    label: 'Ngày đặt hàng',
    type: 'text',
    displayConverter: (createdAt) => (new Date(createdAt)).toLocaleDateString(),
  },
];

const PlatformShipmentsPage = () => {
  const onOrderDelivered = async (order) => {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        orderStatus: OrderStatus.Delivered,
        shipmentStatus: ShipmentStatus.Delivered,
      }),
    });
  }

  const onOrderPaid = async (order) => {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        paymentStatus: PaymentStatus.Completed,
      }),
    });
  }

  const onOrderSelectedToShip = async (order) => {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        orderStatus: OrderStatus.Shipped,
        shipmentStatus: ShipmentStatus.Shipped,
      }),
    });
  }

  const onDeliveryFailed = async (order) => {
    // await fetch('/api/orders', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     orderNumber: order.orderNumber,
    //     orderStatus: OrderStatus.DeliveryFailed,
    //     shipmentStatus: ShipmentStatus.Failed,
    //   }),
    // });

    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        orderStatus: OrderStatus.Cancelled,
        shipmentStatus: ShipmentStatus.Failed,
      }),
    });
  }

  const btnDeliverOrder = ({ order, mutate }) => {
    const hasPaid = order.payments.length > 0 && order.payments.at(-1).status === PaymentStatus.Completed;

    return (
      <div className="mt-4 flex sm:ml-4 sm:mt-0">
        <button
          type="button"
          className="sm:order-0 order-1 ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-0"
          onClick={async () => {
            await onDeliveryFailed(order);
            mutate && mutate();
          }}
        >
          Giao thất bại
        </button>
        {hasPaid ? (
          <button
            type="button"
            className="order-0 inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:order-1 sm:ml-3"
            onClick={async () => {
              await onOrderDelivered(order);
              mutate && mutate();
            }}
          >
            Đã giao hàng
          </button>
        ) : (
          <button
            type="button"
            className="order-0 inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:order-1 sm:ml-3"
            onClick={async () => {
              await onOrderPaid(order);
              mutate && mutate();
            }}
          >
            Đã trả tiền
          </button>
        )}
        
      </div>
    );
  };

  const btnShipOrder = ({ order, mutate }) => (
    <button
      type="button"
      className="sm:order-0 order-1 ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-0"
      onClick={async () => {
        await onOrderSelectedToShip(order);
        mutate && mutate();
      }}
    >
      Nhận hàng
    </button>
  )

  return (
    <div className="flex flex-col space-y-12">
      <PaginatedListPage
        apiUrl='/api/orders/shipments'
        pageParam="pageSelf"
        params={{
          forSelf: 'true',
        }}
        pageTitle="Đơn hàng đang chuyển"
        smallPageTableName="Các đơn hàng"
        columns={columns}
        resource="shipments"
        isMutable={false}
        actionButton={btnDeliverOrder}
      />

      <PaginatedListPage
        apiUrl='/api/orders/shipments'
        pageParam="pageReady"
        pageTitle="Đơn hàng sẵn sàng"
        smallPageTableName="Các đơn hàng"
        columns={columns}
        resource="shipments"
        isMutable={false}
        actionButton={btnShipOrder}
      />
    </div>
  );
}

export default PlatformShipmentsPage;