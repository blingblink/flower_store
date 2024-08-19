'use server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { CURRENCY } from '@/config'
import { formatAmountForStripe } from '@/utils/stripe-helpers'
import { stripe } from '@/lib/stripe'

export async function createCheckoutSession(data) {
  const checkoutSession =
    await stripe.checkout.sessions.create({
      mode: 'payment',
      submit_type: 'pay',
      // customer_email: data.customerEmail,
      metadata: {
        orderNumber: data.orderNumber,
      },  
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: 'Custom amount donation',
            },
            unit_amount: formatAmountForStripe(
              Number(data.customAmount),
              CURRENCY
            ),
          },
        },
      ],
      success_url: `${headers().get(
        'origin'
      )}/orders/${data.orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${headers().get('origin')}/checkout`,
    })

  redirect(checkoutSession.url)
}

export async function createPaymentIntent(
  data
) {
  const paymentIntent =
    await stripe.paymentIntents.create({
      amount: formatAmountForStripe(
        Number(data.get('customDonation')),
        CURRENCY
      ),
      automatic_payment_methods: { enabled: true },
      currency: CURRENCY,
    })

  return { client_secret: paymentIntent.client_secret }
}