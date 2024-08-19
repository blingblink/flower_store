'use client'

import { useState } from "react";
import { useSession } from "next-auth/react"
import * as Yup from 'yup';
import EditorSlideOver from '@/components/EditorSlideOver';

const UserInfoSection = ({ user }) => {
  const [openSlideOver, setSlideOverOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  const { update: updateSession } = useSession();
  const isAuthenticated = !!user;
  
  if (!isAuthenticated) return;

  const onUserUpdate = async (data) => {
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    updateSession(data);
    setSlideOverOpen(false);
  }

  const fields = {
    name: {
      column: {
        key: 'name',
        label: 'Họ tên',
        type: 'text',
        default: '',
      },
      schema: Yup.string()
      .max(50, 'Nhiều nhất 50 kí tự')
      .min(1, 'Ít nhất 1 kí tự')
      .required('Bắt buộc'),
    },
    email: {
      column: {
        key: 'name',
        label: 'Email',
        type: 'text',
        default: '',
      },
      schema: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
    },
    phone: {
      column: {
        key: 'phone',
        label: 'Số điện thoại',
        type: 'text',
        default: '',
      },
      schema: Yup.string().required('Bắt buộc'),
    },
  }

  return (
    <div>
      <EditorSlideOver
        open={openSlideOver}
        isCreate={false}
        setOpen={setSlideOverOpen}
        onUpdate={onUserUpdate}
        columns={selectedField ? [fields[selectedField].column] : []}
        rowValue={user || {}}
        validationSchema={ selectedField ? Yup.object({
          [selectedField]: fields[selectedField].schema,
        }) : {}}
      />
      <h2 className="text-base font-semibold leading-7 text-gray-900">Thông tin cá nhân</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        Xem và chỉnh sửa thông tin cá nhân.
      </p>

      <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
        <div className="pt-6 sm:flex">
          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Họ và tên </dt>
          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <div className="text-gray-900">{user.name}</div>
            <button
              type="button"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
              onClick={() => {
                setSelectedField('name');
                setSlideOverOpen(true);
              }}
            >
              Cập nhật
            </button>
          </dd>
        </div>
        <div className="pt-6 sm:flex">
          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Email</dt>
          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <div className="text-gray-900">{user.email}</div>
            <button
              type="button"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
              onClick={() => {
                setSelectedField('email');
                setSlideOverOpen(true);
              }}
            >
              Cập nhật
            </button>
          </dd>
        </div>
        <div className="pt-6 sm:flex">
          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Số điện thoại</dt>
          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <div className="text-gray-900">{user.phone}</div>
            <button
              type="button"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
              onClick={() => {
                setSelectedField('phone');
                setSlideOverOpen(true);
              }}
            >
              Cập nhật
            </button>
          </dd>
        </div>
        <div className="pt-6 sm:flex">
          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Vai trò</dt>
          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <div className="text-gray-900">{user.role}</div>
          </dd>
        </div>
        <div className="pt-6 sm:flex">
          <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Điểm tích luỹ</dt>
          <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <div className="text-gray-900">{user.scores}</div>
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default UserInfoSection;