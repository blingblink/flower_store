import { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import useSWRImmutable from 'swr/immutable';
import SelectMenu from '@/components/SelectMenu';
import { DiscountType } from '@/constants';
import { formatCurrency } from '@/app/utils';

async function getFromUrl(url) {
  const res = await fetch(url);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    // throw new Error('Failed to fetch data')
  }
 
  return res.json();
}

const OrderSummary = ({ shoppingCart, subtotal, shipping, total, setSelectedDiscount }) => {
  const [selectedDiscount, setDiscount] = useState({});
  const { data: discounts } = useSWRImmutable("/api/discounts?forSelf=true", getFromUrl);
  const discountOptions = discounts ? discounts.map(discount => ({
    id: discount.id,
    value: discount.code,
    secondary: discount.type === DiscountType.percentage ? `-${discount.value}%` : `${discount.value} VND`,
    data: discount,
  })) : [];

  const onDiscountChange = (discount) => {
    setDiscount(discount);
    setSelectedDiscount(discount);
  }

  let discountText;
  if (selectedDiscount?.data) {
    if (selectedDiscount.data.type === DiscountType.percentage) {
      total = total - total * selectedDiscount.data.value * 0.01;
      discountText = `-${selectedDiscount.data.value}%`;
    } else {
      total = total - selectedDiscount.data.value;
      discountText = `-${formatCurrency(selectedDiscount.data.value)}`;
    }
  }

  return (
    <>
      {/* Mobile order summary */}
      <section aria-labelledby="order-heading" className="bg-gray-50 px-4 py-6 sm:px-6 lg:hidden">
        <Disclosure as="div" className="mx-auto max-w-lg">
          {({ open }) => (
            <>
              <div className="flex items-center justify-between">
                <h2 id="order-heading" className="text-lg font-medium text-gray-900">
                  Đơn hàng của bạn
                </h2>
                <Disclosure.Button className="font-medium text-indigo-600 hover:text-indigo-500">
                  {open ? <span>Ẩn đơn hàng</span> : <span>Chi tiết đơn hàng</span>}
                </Disclosure.Button>
              </div>

              <Disclosure.Panel>
                <ul role="list" className="divide-y divide-gray-200 border-b border-gray-200">
                  {shoppingCart && shoppingCart.items.map((productItem) => {
                    const { product } = productItem;
                    return (
                      <li key={productItem.id} className="flex space-x-6 py-6">
                        <img
                          src={product.images[0].src}
                          alt={product.name}
                          className="h-40 w-40 flex-none rounded-md bg-gray-200 object-cover object-center"
                        />
                        <div className="flex flex-col justify-between space-y-4">
                          <div className="space-y-1 text-sm font-medium">
                            <h3 className="text-gray-900">{product.name}</h3>
                            <p className="text-gray-500">{formatCurrency(productItem.price)}</p>
                            <p className="text-gray-500">{productItem.quantity}</p>
                            {/* <p className="text-gray-500">{product.size}</p> */}
                          </div>
                          <div className="flex space-x-4">
                            <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                              Chỉnh sửa
                            </button>
                            <div className="flex border-l border-gray-300 pl-4">
                              <button
                                type="button"
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                Xoá
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-10">
                  <label className="block text-sm font-medium text-gray-700">
                    Mã giảm giá
                  </label>
                  <div className="mt-1 max-w">
                    <SelectMenu
                      options={discountOptions}
                      selected={selectedDiscount}
                      setSelected={option => onDiscountChange(option)}
                    />
                  </div>
                </div>
                {/* <form className="mt-10">
                  <label htmlFor="discount-code-mobile" className="block text-sm font-medium text-gray-700">
                    Discount code
                  </label>
                  <div className="mt-1 flex space-x-4">
                    <input
                      type="text"
                      id="discount-code-mobile"
                      name="discount-code-mobile"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                    >
                      Apply
                    </button>
                  </div>
                </form> */}

                <dl className="mt-10 space-y-6 text-sm font-medium text-gray-500">
                  <div className="flex justify-between">
                    <dt>Tổng tiền hàng</dt>
                    <dd className="text-gray-900">{formatCurrency(subtotal)}</dd>
                  </div>
                  {selectedDiscount && selectedDiscount.id && (
                    <div className="flex justify-between">
                      <dt className="flex">
                        Mã giảm giá
                        <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs tracking-wide text-gray-600">
                          {selectedDiscount.value}
                        </span>
                      </dt>
                      <dd className="text-gray-900">{discountText}</dd>
                    </div>
                  )}
                  {/* <div className="flex justify-between">
                    <dt>Taxes</dt>
                    <dd className="text-gray-900">{taxes}</dd>
                  </div> */}
                  <div className="flex justify-between">
                    <dt>Phí vận chuyển</dt>
                    <dd className="text-gray-900">{formatCurrency(shipping)}</dd>
                  </div>
                </dl>
              </Disclosure.Panel>

              <p className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6 text-sm font-medium text-gray-900">
                <span className="text-base">Thành tiền</span>
                <span className="text-base">{formatCurrency(total)}</span>
              </p>
            </>
          )}
        </Disclosure>
      </section>

      {/* Order summary */}
      <section aria-labelledby="summary-heading" className="hidden w-full max-w-md flex-col bg-gray-50 lg:flex">
        <h2 id="summary-heading" className="sr-only">
          Order summary
        </h2>

        <ul role="list" className="flex-auto divide-y divide-gray-200 overflow-y-auto px-6 pt-6">
          {shoppingCart && shoppingCart.items.map((productItem) => {
            const { product } = productItem;
            return (
              <li key={productItem.id} className="flex space-x-6 py-6">
                <img
                  src={product.images[0].src}
                  alt={product.name}
                  className="h-40 w-40 flex-none rounded-md bg-gray-200 object-cover object-center"
                />
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-1 text-sm font-medium">
                    <h3 className="text-gray-900">{product.name}</h3>
                    <p className="text-gray-500">{formatCurrency(product.price)}</p>
                    <p className="text-gray-500">{productItem.quantity}</p>
                    {/* <p className="text-gray-500">{product.size}</p> */}
                  </div>
                  <div className="flex space-x-4">
                    <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Chỉnh sửa
                    </button>
                    <div className="flex border-l border-gray-300 pl-4">
                      <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Xoá
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="sticky bottom-0 flex-none border-t border-gray-200 bg-gray-50 p-6">
          {/* <form>
            <label htmlFor="discount-code" className="block text-sm font-medium text-gray-700">
              Discount code
            </label>
            <div className="mt-1 flex space-x-4">
              <input
                type="text"
                id="discount-code"
                name="discount-code"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Apply
              </button>
            </div>
          </form> */}
          <div>
            <label htmlFor="discount-code" className="block text-sm font-medium text-gray-700">
              Mã giảm giá
            </label>
            <div className="mt-1 flex space-x-4">
              <SelectMenu
                options={discountOptions}
                selected={selectedDiscount}
                setSelected={option => onDiscountChange(option)}
              />
            </div>
          </div>

          <dl className="mt-10 space-y-6 text-sm font-medium text-gray-500">
            <div className="flex justify-between">
              <dt>Tổng tiền hàng</dt>
              <dd className="text-gray-900">{formatCurrency(subtotal)}</dd>
            </div>
            {selectedDiscount?.data && (
              <div className="flex justify-between">
                <dt className="flex">
                  Mã giảm giá
                  <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs tracking-wide text-gray-600">
                    {selectedDiscount.value}
                  </span>
                </dt>
                <dd className="text-gray-900">{discountText}</dd>
              </div>
            )}
            {/* <div className="flex justify-between">
              <dt>Taxes</dt>
              <dd className="text-gray-900">{taxes}</dd>
            </div> */}
            <div className="flex justify-between">
              <dt>Phí vận chuyển</dt>
              <dd className="text-gray-900">{formatCurrency(shipping)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
              <dt className="text-base">Thành tiền</dt>
              <dd className="text-base">{formatCurrency(total)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}

export default OrderSummary;