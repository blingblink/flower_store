import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/app/db';
import { getOrder, makePayment } from '@/services/orderService';

export async function POST(req) {
  let event

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get('stripe-signature'),
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    // On error, log and return the error message.
    if (err instanceof Error) console.log(err)
    console.log(`❌ Error message: ${errorMessage}`)
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    )
  }

  // Successfully constructed event.
  console.log('✅ Success:', event.id)

  const permittedEvents = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
  ]

  if (permittedEvents.includes(event.type)) {
    let data

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          data = event.data.object
          console.log(`💰 CheckoutSession status: ${data.payment_status}`)
          console.log(JSON.stringify(data, null, 4));
          const orderNumber = data.metadata.orderNumber;
          const order = await getOrder({ orderNumber });
          await makePayment({
            order,
            stripeCheckoutSessionId: data.id,
          });

          break
        case 'payment_intent.payment_failed':
          data = event.data.object
          console.log(`❌ Payment failed: ${data.last_payment_error?.message}`)
          console.log(JSON.stringify(data, null, 4));
          break
        case 'payment_intent.succeeded':
          data = event.data.object
          console.log(`💰 PaymentIntent status: ${data.status}`)
          console.log(JSON.stringify(data, null, 4));
          break
        default:
          throw new Error(`Unhandled event: ${event.type}`)
      }
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { message: 'Webhook handler failed' },
        { status: 500 }
      )
    }
  }
  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: 'Received' }, { status: 200 })
}