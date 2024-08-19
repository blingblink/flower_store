import { getOrder, makePayment } from '@/services/orderService';
import { addPaymentMethod } from '@/services/paymentService';
import { getCurrentUser } from '@/app/api/utils';


const POST = async (req) => {
  const user = await getCurrentUser();
  const { orderNumber, payment: paymentMethodData } = await req.json();

  let paymentMethod;
  if (paymentMethodData) {
    if (paymentMethodData.existing) {
      paymentMethod = paymentMethodData.existing;
    } else {
      paymentMethod = await addPaymentMethod({
        user,
        paymentMethod: {
          ...paymentMethodData.new,
          expirationMonth: parseInt(paymentMethodData.new.expirationMonth),
          expirationYear: parseInt(paymentMethodData.new.expirationYear),
        },
      });
    }
  }
  // nameOnCard: '',
  // cardNumber: '',
  // expirationMonth: '',
  // expirationYear: '',
  // cvc: '',

  // paymentMethod: { existing: { id: 1, cardNumber: '4242', isDefault: true } }

  const order = await getOrder({ orderNumber });
  const payment = await makePayment({ order, paymentMethod });
  return Response.json(payment);
}
  
  
  
export {
  POST,
}