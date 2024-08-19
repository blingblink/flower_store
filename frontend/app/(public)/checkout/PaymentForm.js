import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LockClosedIcon } from '@heroicons/react/20/solid'
import ErrorLine from '@/components/ErrorLine';
import { formatCurrency } from '@/app/utils';

const PaymentForm = ({ onSubmit, totalAmount }) => {
  const today = new Date();
  const currentYear = today.getFullYear();

  const formik = useFormik({
    initialValues: {
      nameOnCard: '',
      cardNumber: '',
      expirationMonth: '',
      expirationYear: '',
      cvc: '',
    },
    validationSchema: Yup.object({
      nameOnCard: Yup.string()
        .max(50, 'Nhiều nhất 50 kí tự')
        .min(1, 'Ít nhất 1 kí tự')
        .required('Bắt buộc'),
      cardNumber: Yup.string()
        .length(19, 'Thẻ cần có 16 chữ số')
        .required('Bắt buộc'),
      expirationMonth: Yup.number()
        .min(1, 'Nhỏ nhất là tháng 1.')
        .max(12, 'Chỉ có 12 tháng.')
        .required('Bắt buộc'),
      expirationYear: Yup.number()
        .min(today.getFullYear(), `Tối thiểu là ${currentYear}`)
        .required('Bắt buộc'),
      cvc: Yup.string()
        .length(3),
    }),
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  const onCardNumberChange = (evt) => {
    const newValue = evt.target.value
      .replace(/[^0-9]/gi, '')
      .replace(/(.{4})/g, '$1 ').trim();
    formik.setFieldValue('cardNumber', newValue);
  }

  const onNumberedStringChange = ({ field, value }) => {
    const newValue = value.replace(/[^0-9]/gi, '').trim();
    formik.setFieldValue(field, newValue);
  }

  return (
    <>
      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm font-medium text-gray-500">Payment Details</span>
        </div>
      </div>

      <form className="mt-6" onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-12 gap-x-4 gap-y-6">
          {/* <div className="col-span-full">
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email-address"
                name="email-address"
                autoComplete="email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div> */}

          <div className="col-span-full">
            <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700">
              Name on card
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="nameOnCard"
                name="nameOnCard"
                placeholder="Full name"
                onChange={formik.handleChange}
                value={formik.values.nameOnCard}
                onBlur={formik.handleBlur}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {formik.touched.nameOnCard && formik.errors.nameOnCard && (
                <ErrorLine message={formik.errors.nameOnCard} />
              )}
            </div>
          </div>

          <div className="col-span-8 sm:col-span-9">
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
              Card number
            </label>
            <div className="mt-1">
              <input
                type="text"
                placeholder="xxxx xxxx xxxx xxxx"
                id="cardNumber"
                name="cardNumber"
                autoComplete="Mã thẻ"
                onChange={onCardNumberChange}
                value={formik.values.cardNumber}
                onBlur={formik.handleBlur}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                maxLength={19}
              />
              {formik.touched.cardNumber && formik.errors.cardNumber && (
                <ErrorLine message={formik.errors.cardNumber} />
              )}
            </div>
          </div>

          <div className="col-span-4 sm:col-span-3">
            <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
              CVC
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="cvc"
                id="cvc"
                onChange={(evt) => onNumberedStringChange({ field: 'cvc', value: evt.target.value })}
                value={formik.values.cvc}
                onBlur={formik.handleBlur}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                maxLength={3}
              />
              {formik.touched.cvc && formik.errors.cvc && (
                <ErrorLine message={formik.errors.cvc} />
              )}
            </div>
          </div>
          
          <div className="col-span-full">
            <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700">
              Expiration date
            </label>
            <div className="mt-1 inline-flex">
              <input
                type="text"
                name="expirationMonth"
                id="expirationMonth"
                placeholder="MM"
                onChange={(evt) => onNumberedStringChange({ field: 'expirationMonth', value: evt.target.value })}
                value={formik.values.expirationMonth}
                onBlur={formik.handleBlur}
                className="block w-full sm:w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                maxLength={2}
              />
              <input
                type="text"
                name="expirationYear"
                id="expirationYear"
                placeholder="YYYY"
                onChange={(evt) => onNumberedStringChange({ field: 'expirationYear', value: evt.target.value })}
                value={formik.values.expirationYear}
                onBlur={formik.handleBlur}
                className="block w-full sm:w-20 ml-4 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                maxLength={4}
              />
            </div>
            {formik.touched.expirationMonth && formik.errors.expirationMonth && (
              <ErrorLine message={formik.errors.expirationMonth} />
            )}
            {formik.touched.expirationYear && formik.errors.expirationYear && (
              <ErrorLine message={formik.errors.expirationYear} />
            )}
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

        <button
          type="submit"
          className="mt-6 w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          // onClick={onSubmit}
        >
          Thanh toán {formatCurrency(totalAmount)}
        </button>
        <p className="mt-6 flex justify-center text-sm font-medium text-gray-500">
          <LockClosedIcon className="mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Bảo mật
        </p>
      </form>
    </>
  );
}

export default PaymentForm;