import { getRevenues } from '@/services/revenueService';

const GET = async (request) => {
  // const user = await getCurrentUser();
  // if (!user) return Response.json({
  //   data: null,
  // });
  const searchParams = request.nextUrl.searchParams;
  const statusesStr = searchParams.get('statuses') || '';
  const statuses = statusesStr.split(',').filter(status => status.trim() !== '');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  
  const revenues = await getRevenues({ statuses, fromDate, toDate});
  return Response.json(revenues);
}


export {
  GET,
}