import { getPaymentMethodsForUser } from '@/services/paymentService';
import { getCurrentUser } from '@/app/api/utils';

const GET = async () => {
    const user = await getCurrentUser();
    const paymentMethods = await getPaymentMethodsForUser({ user });
    return Response.json(paymentMethods);
  }
  
  
  
  export {
    GET,
  }