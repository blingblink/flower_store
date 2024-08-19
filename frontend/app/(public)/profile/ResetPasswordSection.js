'use client'
import { useState } from 'react';
import * as Yup from 'yup';
import YupPassword from 'yup-password';
import EditorSlideOver from '@/components/EditorSlideOver';

YupPassword(Yup);

const ResetPasswordSection = ({ user }) => {
  const [openSlideOver, setSlideOverOpen] = useState(false);
  if (!user) return;

  const schema = Yup.object({
    password: Yup.string().required('Bắt buộc'),
    newPassword: Yup.string().password().required('Bắt buộc'),
    retypedPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], "Passwords don't match").required('Confirm Password is required'),
  });
  const columns = [
    {
      key: 'password',
      label: 'Mật khẩu hiện tại',
      type: 'text',
      default: '',
    },
    {
      key: 'newPassword',
      label: 'Mật khẩu mới',
      type: 'text',
      default: '',
    },
    {
      key: 'retypedPassword',
      label: 'Nhập lại mật khẩu mới',
      type: 'text',
      default: '',
    }
  ]

  const onSubmit = async (data) => {
    await fetch('/api/users/me/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: data.password,
        newPassword: data.newPassword,
      }),
    });
    setSlideOverOpen(false);
  }

  return (
    <div>
      <EditorSlideOver
        open={openSlideOver}
        isCreate={false}
        setOpen={setSlideOverOpen}
        onUpdate={onSubmit}
        columns={columns}
        rowValue={{}}
        validationSchema={schema}
      />
      <h2 className="text-base font-semibold leading-7 text-gray-900">Thay đổi mật khẩu</h2>

      <div className="mt-6 flex">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => {
            setSlideOverOpen(true);
          }}
        >
          Thay đổi
        </button>
      </div>
    </div>
  );
}

export default ResetPasswordSection;