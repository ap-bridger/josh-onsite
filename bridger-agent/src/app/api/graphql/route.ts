import { getTransactions, updateCategory, updateVendor } from "@/server/modules/transactions/api";

import { createSchema, createYoga } from "graphql-yoga";

const { handleRequest } = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        transactions(input: TransactionsInput!): [Transaction!]!
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
      }

    `,
    resolvers: {
      Query: {
        transactions: async (_, { input }) => {
          const transactions = await getTransactions(input);
          return transactions;
        }
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
