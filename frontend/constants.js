const Categories = [
    {
      name: 'Hoa hồng',
      en: 'rose',
    },
    {
      name: 'Hoa hướng dương',
      en: 'sunflower'
    },
    {
      name: 'Hoa đồng tiền',
      en: 'Gerbera',
    },
    {
      name: 'Lan hồ điệp',
      en: 'Orchids',
    },
    {
      name: 'Cẩm chướng',
      en: 'Carnation',
    },
    {
      name: 'Hoa cát tường',
      en: 'Lisianthus',
    },
    {
      name: 'Hoa cúc',
      en: 'Chrysanthemum',
    },
];

const PaymentStatus = Object.freeze({
    Unpaid: 'Unpaid',
    Pending: 'Pending',
    Completed: 'Completed',
    Failed: 'Failed',
    Declined: 'Declined',
    Canceled: 'Canceled',
    Settling: 'Settling',
    Settled: 'Settled',
    Refunded: 'Refunded',
});

const ShipmentStatus = Object.freeze({
    Pending: 'Pending',
    Shipped: 'Shipped',
    Delivered: 'Delivered',
    OnHold: 'On Hold',
    Failed: 'Failed',
    Cancelled: 'Cancelled', // Order cancelled
});

const OrderStatus = Object.freeze({
    OrderPlaced: 'Chờ xác nhận',
    Processing: 'Chờ lấy hàng',
    Shipped: 'Đang giao hàng',
    Delivered: 'Đã giao hàng',
    Cancelled: 'Huỷ đơn hàng',
    DeliveryFailed: 'Giao hàng thất bại',
});

const DiscountType = Object.freeze({
    scalar: 'Scalar',
    percentage: 'Percentage',
});

const UserRoles = Object.freeze({
    Admin: 'Admin',
    Employee: 'Nhân viên',
    Guest: 'Khách vãng lai',
    User: 'Khách hàng',
    SilverCustomer: 'Khách hàng thẻ bạc',
    GoldCustomer: 'Khách hàng thẻ vàng',
    PlatinumCustomer: 'Khách hàng thẻ bạch kim',
});

export {
    Categories,
    PaymentStatus,
    ShipmentStatus,
    OrderStatus,
    DiscountType,
    UserRoles,
}