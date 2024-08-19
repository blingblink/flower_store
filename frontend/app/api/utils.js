import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth";
import prisma from "../db";

const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
}

const getDetailedCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  const shortUser = session?.user;
  if (!shortUser) return;
  
  return await prisma.user.findUnique({
    where: {id: shortUser.id},
    include: {
      addresses: true,
      paymentMethods: true,
    },
  })
}

export {
  getCurrentUser,
  getDetailedCurrentUser,
}