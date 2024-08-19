'use client'

import { useState, useEffect, useContext } from 'react';
import { shoppingCartContext } from '@/context/shoppingCart';
import { useRouter } from 'next/navigation';
import { LockClosedIcon } from '@heroicons/react/20/solid'
import useSWRImmutable from 'swr/immutable';
import SelectMenu from '@/components/SelectMenu';
import OrderSummary from './OrderSummary';
import PaymentForm from './PaymentForm';
import AddressForm from './AddressForm';
import { DiscountType, UserRoles } from '@/constants';
import { createCheckoutSession } from '@/actions/stripe'

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

export default function CheckoutPage() {
  const router = useRouter();
  const { shoppingCart } = useContext(shoppingCartContext);
  const { data: paymentMethods } = useSWRImmutable('/api/paymentMethods', getFromUrl);
  const { data: user } = useSWRImmutable("/api/users/me", getFromUrl);

  const paymentOptions = paymentMethods ? paymentMethods.map(payment => ({
    id: payment.id,
    value: payment.cardNumber,
    secondary: payment.isDefault ? 'Default' : '',
  })) : [];
  const newPaymentOptionId = 'add-new-payment';
  // paymentOptions.push({
  //   id: newPaymentOptionId,
  //   value: 'Add new payment',
  //   secondary: '',
  // });
  const cardPaymentOptionId = 'card-payment';
  paymentOptions.push({
      id: cardPaymentOptionId,
      value: 'Thẻ tín dụng',
      secondary: '',
    });
  const cashPaymentOptionId = 'cash-payment';
  paymentOptions.push({
    id: cashPaymentOptionId,
    value: 'Cash on delivery',
    secondary: '',
  });
  const [selectedPayment, setSelectedPayment] = useState({});
  const [selectedDiscount, setSelectedDiscount] = useState();
  const [guestUserData, setGuestUserData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    // Set the default payment method, or the first option if there are no defaults;
    if (!paymentOptions || paymentOptions.length < 1) return;

    const defaultPayment = paymentOptions.find(payment => payment.isDefault);
    setSelectedPayment(defaultPayment || paymentOptions[0]);
  }, [paymentMethods]);

  // Price calculations
  let subtotal = 0;
  let shipping = 0;
  let total = 0;
  let discountText;

  if (shoppingCart) {
    shoppingCart.items.forEach(productItem => {
      subtotal += productItem.quantity * productItem.price;
    });
    shipping = 50000.0;
    total = subtotal + shipping;
  }
  if (selectedDiscount?.data) {
    if (selectedDiscount.data.type === DiscountType.percentage) {
      total = total - total * selectedDiscount.data.value * 0.01;
      discountText = `-${selectedDiscount.data.value}%`;
    } else {
      total = total - selectedDiscount.data.value;
      discountText = `-${selectedDiscount.data.value} VND`;
    }
  }
  const isNewPayment = selectedPayment && selectedPayment.id === newPaymentOptionId;
  const isCashPayment = selectedPayment && selectedPayment.id === cashPaymentOptionId;
    

  const onSubmitPayment = async (newPayment = null) => {
    // Save guest data

    console.log({user, prev: true})
    if (user.addresses.length === 0 || !user.addresses.includes(guestUserData.address)) {
      await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streetAddress: guestUserData.address,
        }),
      });
    }
    await fetch('/api/users', {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user.id,
        name: user.name ? user.name : guestUserData.name,
        phone: user.phone ? user.phone : guestUserData.phone,
      }),
    });
    console.log({user})

    // Make order
    const orderResp = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(selectedDiscount && selectedDiscount.id ? {
          discountCode: selectedDiscount.value,
        } : {}),
      }),
    });
    const orderRespJson = await orderResp.json();
    // TODO: Display the errors
    if (!orderRespJson.ok) {
      return;
    }

    // Payment
    // let payment;
    // if (isNewPayment) {
    //   payment = newPayment;
    // }
    // else if (isCashPayment) {
    //   payment = null;
    // }
    // else {
    //   payment = paymentMethods.find(method => method.id === selectedPayment.id)
    // }

    const newOrder = orderRespJson.data;
    if (isCashPayment) {
      const requestData = {
        payment: null,
        orderNumber: newOrder.orderNumber,
      };
      const resp = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      router.push(`/orders/${newOrder.orderNumber}`)
    }
    else {
      const stripeData = {
        customerEmail: user.email,
        customAmount: total,
        orderNumber: newOrder.orderNumber,
      }
  
      // include redirection
      await createCheckoutSession(stripeData);
    }
  }

  return (
    <>
      <main className="lg:flex lg:flex-row-reverse lg:overflow-hidden">
        {/* <div className="px-4 py-6 sm:px-6 lg:hidden">
          <div className="mx-auto flex max-w-lg">
            <a href="#">
              <span className="sr-only">Your Company</span>
              <img
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
                className="h-8 w-auto"
              />
            </a>
          </div>
        </div> */}

        <h1 className="sr-only">Checkout</h1>
        <OrderSummary
          shoppingCart={shoppingCart}
          total={total}
          subtotal={subtotal}
          shipping={shipping}
          setSelectedDiscount={setSelectedDiscount}
        />

        {/* Checkout form */}
        <section
          aria-labelledby="payment-heading"
          className="flex-auto overflow-y-auto px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-0"
        >
          {/* Address */}
          {user?.addresses && user?.addresses.length === 0 && (
            <div className="mx-auto max-w-lg lg:pt-10">
              <AddressForm
                onChange={(key, value) => {
                  setGuestUserData(prev => ({
                    ...prev,
                    [key]: value,
                  }))
                }}
              />
            </div>
          )}
          
          <div className="mx-auto max-w-lg lg:pt-10">
            <SelectMenu
              label="Phương thức thanh toán"
              options={paymentOptions}
              selected={selectedPayment}
              setSelected={setSelectedPayment}
            />

            {(paymentMethods && selectedPayment && selectedPayment.id === newPaymentOptionId) ? (
              <PaymentForm
                onSubmit={onSubmitPayment}
                totalAmount={total}
              />
            ) : (
              <>
                <button
                  type="button"
                  className="mt-6 w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={async () => await onSubmitPayment()}
                >
                  {isCashPayment ? 'Đặt hàng' : `Thanh toán ${total}`}
                </button>
              </>
            )}
            {/* <form action={createCheckoutSession}>
              <input
                name="customAmount"
                type="hidden"
                value={total}
              />
              <input
                name="customerEmail"
                type="hidden"
                value={user.email}
              />
              <button
                type="submit"
              >
                Stripe
              </button>
            </form> */}
          </div>
        </section>
      </main>
    </>
  )
}
