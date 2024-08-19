import prisma from "@/app/db";

const GET = async () => {
    const categories = await prisma.category.findMany();
    return Response.json(categories);
}

export {
    GET,
}