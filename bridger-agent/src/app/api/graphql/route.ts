import { greetings } from "@/server/modules/greet/api";
import { getTransactions } from "@/server/modules/transactions/api";

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
        vendor: String!
        category: String!
        spentCents: Int!
        recievedCents: Int!
        status: Status!
        comments: [String!]!
      }
    `,
    resolvers: {
      Query: {
        transactions: async (_, { input }) => {
          const transactions = await getTransactions(input);
          return transactions;
        }
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
