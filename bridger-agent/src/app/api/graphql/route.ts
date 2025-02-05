import { getTransactions, updateCategory, updateVendor, updateStatus, getAllVendors, getAllCategories } from "@/server/modules/transactions/api";

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
        updateVendor(id: String!, vendor: String!): Transaction!
        updateCategory(id: String!, category: String!): Transaction!
        approveTransaction(id: String!): Transaction!
        excludeTransaction(id: String!): Transaction!
        sendTransactionToClient(id: String!): Transaction!
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
        updateVendor: async (_, { id, vendor }) => {
          const transaction = await updateVendor({ id, vendor });
          return transaction;
        },
        updateCategory: async (_, { id, category }) => {
          const transaction = await updateCategory({ id, category });
          return transaction;
        },
        approveTransaction: async (_, { id }) => {
          const transaction = await updateStatus({ id, status: "Approved" });
          return transaction;
        },
        excludeTransaction: async (_, { id }) => {
          const transaction = await updateStatus({ id, status: "Excluded" });
          return transaction;
        },
        sendTransactionToClient: async (_, { id }) => {
          const transaction = await updateStatus({ id, status: "PendingSendToClient" });
          return transaction;
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
