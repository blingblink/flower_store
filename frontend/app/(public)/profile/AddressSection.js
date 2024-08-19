'use client'

import { useState } from 'react';
import * as Yup from 'yup';
import { mutate } from "swr"

import EditorSlideOver from '@/components/EditorSlideOver';

const AddressSection = ({ user }) => {
  const [openSlideOver, setSlideOverOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isCreate, setIsCreate] = useState(false);
  
  if (!user) return;

  const schema = Yup.object({
    streetAddress: Yup.string()
      .max(50, 'Nhiều nhất 50 kí tự')
      .min(1, 'Ít nhất 3 kí tự')
      .required('Bắt buộc'),
  });
  const columns = [
    {
      key: 'streetAddress',
      label: 'Địa chỉ',
      type: 'text',
      default: '',
    }
  ]

  const onAddressCreate = async (data) => {
    await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    mutate("/api/users/me");
    setSlideOverOpen(false);
  }

  const onAddressUpdate = async (data) => {
    await fetch('/api/addresses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    mutate("/api/users/me");
    setSlideOverOpen(false);
  }

  const onAddressDelete = async (data) => {
    await fetch('/api/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    mutate("/api/users/me");
    setSlideOverOpen(false);
  }


  return (
    <div>
      <EditorSlideOver
        open={openSlideOver}
        isCreate={isCreate}
        setOpen={setSlideOverOpen}
        onCreate={onAddressCreate}
        onUpdate={onAddressUpdate}
        onDelete={onAddressDelete}
        columns={columns}
        rowValue={selectedAddress || {}}
        validationSchema={schema}
      />
      <h2 className="text-base font-semibold leading-7 text-gray-900">Địa chỉ</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">Quản lí địa chỉ.</p>

      <ul role="list" className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
        {user?.addresses?.map(address => (
          <li key={address.id} className="flex justify-between gap-x-6 py-6">
            <div className="font-medium text-gray-900">{address.streetAddress}</div>
            <button
              type="button"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
              onClick={() => {
                setIsCreate(false);
                setSelectedAddress(address);
                setSlideOverOpen(true);
              }}  
            >
              Update
            </button>
          </li>
        ))}
      </ul>

      <div className="flex border-t border-gray-100 pt-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          onClick={() => {
            setIsCreate(true);
            setSelectedAddress({});
            setSlideOverOpen(true);
          }}  
        >
          <span aria-hidden="true">+</span> Thêm địa chỉ
        </button>
      </div>
    </div>
  );
}

export default AddressSection;