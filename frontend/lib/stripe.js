import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY;
export const stripe = new Stripe(secretKey, {
  apiVersion: '2022-11-15',
});
  // {
  //   // https://github.com/stripe/stripe-node#configuration
  //   apiVersion: '2022-11-15',
  //   appInfo: {
  //     name: 'nextjs-with-stripe-typescript-demo',
  //     url: 'https://nextjs-with-stripe-typescript-demo.vercel.app',
  //   },
  // }
// )