'use client'

import * as Yup from 'yup';
import { UserRoles } from '@/constants';
import PaginatedListPage from '@/components/PaginatedListPage';

const columns = [
  {
    key: 'name',
    label: 'Tên người dùng',
    type: 'text',
    // disabled: true,
    default: '',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    // disabled: true,
    default: '',
  },
  {
    key: 'role',
    label: 'Vai trò',
    type: 'dropdown',
    default: '',
    acceptableValues: Object.values(UserRoles),
  },
  {
    key: 'scores',
    label: 'Scores',
    type: 'text',
    // disabled: true,
    default: 0,
  },
//   {
//     key: 'disabled',
//     label: 'Vô hiệu hoá',
//     type: 'checkbox',
//     default: false,
//   },
];

const validationSchema = Yup.object({
  role: Yup.string()
    .required('Bắt buộc'),
//   disabled: Yup.boolean()
//     .default(false),
});

const PlatformUsersPage = () => {
  const onUpdate = async (user) => {
    console.log({user})
    const requestBody = {};
    columns.forEach(column => {
      if (column.disabled) return;
      requestBody[column.key] = user[column.key];
    })

    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...requestBody,
        id: user.id,
      }),
    });
  }

  return (
    <PaginatedListPage
      apiUrl='/api/users'
      pageTitle="Người dùng"
      smallPageTableName="Các người dùng"
      columns={columns}
      onUpdate={onUpdate}
      validationSchema={validationSchema}
      resource="users"
    />
  );
}

export default PlatformUsersPage;