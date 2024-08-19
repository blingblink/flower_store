import { useFormik } from 'formik';
import * as Yup from 'yup';
import ErrorLine from '@/components/ErrorLine';

const AddressForm = ({ onChange }) => {
  const formik = useFormik({
    initialValues: {
        address: '',
        name: '',
        phone: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(50, 'Nhiều nhất 50 kí tự')
        .min(1, 'Ít nhất 1 kí tự')
        .required('Bắt buộc'),
      address: Yup.string()
        .required('Bắt buộc'),
      phone: Yup.string()
        .required('Bắt buộc'),
    }),
    // onSubmit: async (values) => {
    //   await onSubmit(values);
    // },
  });

  const onValueChange = (key, value) => {
    formik.setFieldValue(key, value);
    onChange(key, value);
  }

  return (
    <>
      <form className="mt-6" onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-12 gap-x-4 gap-y-6">
          <div className="col-span-full">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Tên người nhận
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Full name"
                // onChange={formik.handleChange}
                onChange={evt => onValueChange('name', evt.target.value)}
                value={formik.values.name}
                onBlur={formik.handleBlur}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {formik.touched.name && formik.errors.name && (
                <ErrorLine message={formik.errors.name} />
              )}
            </div>
          </div>

          <div className="col-span-8 sm:col-span-9">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Địa chỉ
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="address"
                name="address"
                onChange={evt => onValueChange('address', evt.target.value)}
                value={formik.values.address}
                onBlur={formik.handleBlur}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {formik.touched.address && formik.errors.address && (
                <ErrorLine message={formik.errors.address} />
              )}
            </div>
          </div>

          <div className="col-span-8 sm:col-span-9">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="phone"
                name="phone"
                onChange={evt => onValueChange('phone', evt.target.value)}
                value={formik.values.phone}
                onBlur={formik.handleBlur}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {formik.touched.phone && formik.errors.phone && (
                <ErrorLine message={formik.errors.phone} />
              )}
            </div>
          </div>

          {/* <div className="col-span-full">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="address"
                name="address"
                autoComplete="street-address"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="col-span-full sm:col-span-4">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="city"
                name="city"
                autoComplete="address-level2"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="col-span-full sm:col-span-4">
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">
              State / Province
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="region"
                name="region"
                autoComplete="address-level1"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="col-span-full sm:col-span-4">
            <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">
              Postal code
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="postal-code"
                name="postal-code"
                autoComplete="postal-code"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div> */}
        </div>

        {/* <button
          type="submit"
          className="mt-6 w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Pay {totalAmount}
        </button>
        <p className="mt-6 flex justify-center text-sm font-medium text-gray-500">
          <LockClosedIcon className="mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Secured payment
        </p> */}
      </form>
    </>
  );
}

export default AddressForm;