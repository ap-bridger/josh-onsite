import { prisma } from "@/lib/db";
import exp from "constants";

export const getTransactions = async ({ status }: { status: [string] }) => {
  const transactions = await prisma.transaction.findMany({
    where: {
        status: {
            in: status,
        },
    },
  });
  return transactions.map((transaction) => ({
    ...transaction,
    lastUpdated: transaction.lastUpdated.toISOString(),
    date: transaction.date.toISOString(),
    }));
};

export const updateVendor = async ({ id, vendor }: { id: string, vendor: string }) => {
    const transaction = await prisma.transaction.update({
        where: {
            id,
        },
        data: {
            vendor,
        },
    });
    return {
        ...transaction,
        lastUpdated: transaction.lastUpdated.toISOString(),
        date: transaction.date.toISOString(),
    };
};

export const updateCategory = async ({ id, category }: { id: string, category: string }) => {
    const transaction = await prisma.transaction.update({
        where: {
            id,
        },
        data: {
            category,
        },
    });
    return {
        ...transaction,
        lastUpdated: transaction.lastUpdated.toISOString(),
        date: transaction.date.toISOString(),
    };
};