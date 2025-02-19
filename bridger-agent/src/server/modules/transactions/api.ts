import { prisma } from "@/lib/db";

const validStatusTransitions: { [key: string]: string[] } = {
  AutoCategorized: ["Approved", "Excluded", "PendingSendToClient"],
  Approved: ["ApprovedSyncedWithQuickBooks"],
  Excluded: ["ExcludedSyncedWithQuickBooks"],
  PendingSendToClient: ["SentToClient"],
  SentToClient: [
    "ClientCommucationRecieved",
    "NeedsHumanApproval",
    "NeedsHumanReview",
  ],
  NeedsHumanReview: ["Approved", "Excluded", "PendingSendToClient"],
};

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

export const getAllVendors = async () => {
  const vendors = await prisma.transaction.findMany({
    select: {
      vendor: true,
    },
  });
  return Array.from(new Set(vendors.map((vendor) => vendor.vendor).filter((vendor) => vendor !== "")));
};

export const getAllCategories = async () => {
  const categories = await prisma.transaction.findMany({
    select: {
      category: true,
    },
  });
  return Array.from(new Set(categories.map((category) => category.category).filter((category) => category !== "")));
};

export const updateVendor = async ({
  id,
  vendor,
}: {
  id: string;
  vendor: string;
}) => {
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

export const updateCategory = async ({
  id,
  category,
}: {
  id: string;
  category: string;
}) => {
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

export const updateStatus = async ({
  id,
  status,
  vendor,
  category
}: {
  id: string;
  status: string;
  vendor?: string;
  category?: string;
}) => {
  const currentTransaction = await prisma.transaction.findUnique({
    where: {
      id,
    },
  });

  if (!currentTransaction) {
    throw new Error("Transaction not found");
  }

  const validNewStatuses = validStatusTransitions[currentTransaction.status];
  if (!validNewStatuses.includes(status)) {
    throw new Error(
      `Invalid status transition from ${currentTransaction.status} to ${status}`
    );
  }

  const transaction = await prisma.transaction.update({
    where: {
      id,
    },
    data: {
      status,
      vendor,
      category
    },
  });
  return {
    ...transaction,
    lastUpdated: transaction.lastUpdated.toISOString(),
    date: transaction.date.toISOString(),
  };
};

export const sendClientNotification = async ({
  ids,
  content,
}: {
  ids: string[];
  content: string;
}) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  for (const transaction of transactions) {
    if (transaction.status !== "PendingSendToClient") {
      throw new Error("Can only send pending notifications");
    }
  }

  // TODO: Send for real
  console.log("SENDING FOR IDS:", ids, "CONTENT:", content);
  await prisma.transaction.updateMany({
    where: {
      id: {
        in: ids,
      },
      status: "PendingSendToClient",
    },
    data: {
      status: "SentToClient",
    },
  });
  return ids;
};
