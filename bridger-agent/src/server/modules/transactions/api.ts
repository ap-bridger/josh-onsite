import { prisma } from "@/lib/db";

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