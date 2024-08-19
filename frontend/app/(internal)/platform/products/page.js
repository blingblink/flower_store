'use client'

import * as Yup from 'yup';
import { UserRoles } from '@/constants';
import PaginatedListPage from '@/components/PaginatedListPage';
import { Categories } from '@/constants';
import { formatCurrency } from '@/app/utils';

const columns = [
  {
    key: 'name',
    label: 'Tên sản phẩm',
    type: 'text',
    default: '',
  },
  {
    key: 'description',
    label: 'Miêu tả',
    type: 'text', // textarea
    default: '',
    hideOnRead: true,
  },
  {
    key: 'features',
    label: 'Các đặc điểm',
    hideOnRead: true,
    type: 'text',
    default: '',
  },
  {
    key: 'price',
    label: 'Giá tiền',
    type: 'number',
    default: 0,
    displayConverter: (price) => formatCurrency(price),
  },
  {
    key: 'availableItemCount',
    label: 'Số lượng',
    type: 'number',
    default: 0,
  },
  {
    key: 'views',
    label: 'Số lượt xem',
    type: 'number',
    disabled: true,
    default: 0,
  },

  // Relations
  {
    key: 'category',
    label: 'Thể loại',
    type: 'dropdown',
    default: '',
    acceptableValues: Categories.map(cat => cat.name),
  },
  {
    key: 'images',
    label: 'Ảnh',
    type: 'images',
    default: [],
    hideOnRead: true,
  },
];

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Bắt buộc'),
  description: Yup.string()
    .required('Bắt buộc'),
  features: Yup.string()
    .required('Bắt buộc'),
  price: Yup.number()
    .min(0, 'Phải lớn hơn 0')
    .required('Bắt buộc'),
  availableItemCount: Yup.number()
    .min(0, 'Phải lớn hơn 0')
    .required('Bắt buộc'),
  category: Yup.string()
    .required('Bắt buộc'),
  images: Yup.array().of(Yup.object())
    .required('Bắt buộc'),
//   disabled: Yup.boolean()
//     .default(false),
});

const PlatformProductsPage = () => {
  const onCreate = async (product) => {
    console.log({product})
    const requestBody = {};
    columns.forEach(column => {
      if (column.disabled) return;
      requestBody[column.key] = product[column.key];
    })

    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  }

  const onUpdate = async (product) => {
    console.log({product})
    const requestBody = {};
    columns.forEach(column => {
      if (column.disabled) return;
      requestBody[column.key] = product[column.key];
    })


    await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...requestBody,
        id: product.id,
      }),
    });
  }
  const onDelete = async (product) => {
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: product.id,
      }),
    });
  }

  return (
    <PaginatedListPage
      apiUrl='/api/products'
      params={{
        isPublic: 'true',
      }}
      pageTitle="Sản phẩm"
      smallPageTableName="Các sản phẩm"
      columns={columns}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      validationSchema={validationSchema}
      resource="products"
    />
  );
}

export default PlatformProductsPage;