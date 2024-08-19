'use client'

import * as Yup from 'yup';
import { DiscountType, UserRoles } from '@/constants';
import PaginatedListPage from '@/components/PaginatedListPage';

const columns = [
  {
    key: 'code',
    label: 'Mã khuyến mãi',
    type: 'text',
    default: '',
  },
  {
    key: 'type',
    label: 'Loại khuyến mãi',
    type: 'dropdown',
    default: '',
    acceptableValues: Object.values(DiscountType),
  },
  {
    key: 'value',
    label: 'Giá trị',
    type: 'number',
    default: '',
  },
  {
    key: 'userRole',
    label: 'Dành cho',
    type: 'dropdown',
    default: '',
    acceptableValues: ['', UserRoles.SilverCustomer, UserRoles.GoldCustomer, UserRoles.PlatinumCustomer],
  },
  {
    key: 'fromDate',
    label: 'Từ ngày',
    type: 'date',
    default: '',
    displayConverter: (dateStr) => (new Date(dateStr)).toLocaleDateString(),
  },
  {
    key: 'toDate',
    label: 'Đến ngày',
    type: 'date',
    default: '',
    displayConverter: (dateStr) => (new Date(dateStr)).toLocaleDateString(),
  },
  {
    key: 'isActive',
    label: 'Hoạt động',
    type: 'checkbox',
    default: true,
  },
];

const validationSchema = Yup.object({
  code: Yup.string()
    .required('Bắt buộc'),
  type: Yup.string()
    .required('Bắt buộc'),
  value: Yup.number()
    .required('Bắt buộc'),
  isActive: Yup.boolean()
    .required('Bắt buộc'),
});

const PlatformDiscountsPage = () => {
  const onCreate = async (discount) => {
    await fetch('/api/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discount),
    });
  }
  const onUpdate = async (discount) => {
    await fetch('/api/discounts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discount),
    });
  }
  const onDelete = async (discount) => {
    await fetch('/api/discounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discount),
    });
  }

  return (
    <PaginatedListPage
      apiUrl='/api/discounts'
      pageTitle="Mã khuyến mãi"
      smallPageTableName="Các mã khuyến mãi"
      columns={columns}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      validationSchema={validationSchema}
      resource="discounts"
    />
  );
}

export default PlatformDiscountsPage;