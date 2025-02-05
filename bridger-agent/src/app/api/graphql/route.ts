import {
  getTransactions,
  updateCategory,
  updateVendor,
  updateStatus,
  sendClientNotification,
  getAllVendors,
  getAllCategories,
} from "@/server/modules/transactions/api";

import { createSchema, createYoga } from "graphql-yoga";
import { get } from "http";

const { handleRequest } = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        transactions(input: TransactionsInput!): [Transaction!]!
        getAllVendors: [String!]!
        getAllCategories: [String!]!
      }

      input TransactionsInput {
        status: [Status!]!
      }

      enum Status {
        AutoCategorized
        Approved
        ApprovedSyncedWithQuickBooks
        Excluded
        ExcludedSyncedWithQuickBooks

        PendingSendToClient
        SentToClient
        ClientCommucationRecieved
        NeedsHumanApproval
        NeedsHumanReview
      }

      type Transaction {
        id: String!
        lastUpdated: String!
        date: String!
        description: String!
        vendor: String
        category: String
        spentCents: Int!
        recievedCents: Int!
        status: Status!
        comments: [String!]!
      }

      type Mutation {
        approveTransaction(id: String!, vendor: String!, category: String!): Transaction!
        excludeTransaction(id: String!): Transaction!
        sendTransactionToClient(id: String!): Transaction!
        sendTransactionNotification(
          ids: [String!]!
          content: String!
        ): [String!]!
      }
    `,
    resolvers: {
      Query: {
        transactions: async (_, { input }) => {
          const transactions = await getTransactions(input);
          return transactions;
        },
        getAllVendors: async () => {
          const vendors = await getAllVendors();
          return vendors;
        },
        getAllCategories: async () => {
          const categories = await getAllCategories();
          return categories;
        },
      },
      Mutation: {
        approveTransaction: async (_, { id, vendor, category }) => {
          const transaction = await updateStatus({ id, status: "Approved", vendor, category });
          return transaction;
        },
        excludeTransaction: async (_, { id }) => {
          const transaction = await updateStatus({ id, status: "Excluded" });
          return transaction;
        },
        sendTransactionToClient: async (_, { id }) => {
          const transaction = await updateStatus({
            id,
            status: "PendingSendToClient",
          });
          return transaction;
        },
        sendTransactionNotification: async (_, { ids, content }) => {
          return await sendClientNotification({ ids, content });
        },
      },
    },
  }),

  // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
  graphqlEndpoint: "/api/graphql",

  // Yoga needs to know how to create a valid Next response
  fetchAPI: { Response },
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
