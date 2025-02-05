"use client";

import { DataTable } from "@/design-system/data-table/DataTable.component";
import { ApolloProvider, gql, useQuery } from "@apollo/client";
import { createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";

type Column = {
  date: Date,
  description: String,
  vendor: String,
  category: String,
  spentCents: Number,
  recievedCents: Number,
  status: String
  action: String
}
const columnHelper = createColumnHelper<Column>();

const allColumns = {
  date: columnHelper.accessor("date", {
    id: "date",
  }),
  description: columnHelper.accessor("description", {
    id: "description",
  }),
  vendor: columnHelper.accessor("vendor", {
    id: "vendor",
  }),
  category: columnHelper.accessor("category", {
    id: "category",
  }),
  spentCents: columnHelper.accessor("spentCents", {
    id: "spent",
    cell: ({ cell }) => {
      const value = Number(cell.getValue());
      return value === 0 ? "" : Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value / 100);
    }
  }),
  recievedCents: columnHelper.accessor("recievedCents", {
    id: "recieved",
    cell: ({ cell }) => {
      const value = Number(cell.getValue());
      return value === 0 ? "" : Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value / 100);
    }
  }),
  status: columnHelper.accessor("status", {
    id: "status",
  }),
}

const categorizationColumns = [
  allColumns.date,
  allColumns.description,
  allColumns.vendor,
  allColumns.category,
  allColumns.spentCents,
  allColumns.recievedCents,
  columnHelper.accessor("action", {
    id: "action",
  }),
];

const toQuickBooksColumns = [
  allColumns.date,
  allColumns.description,
  allColumns.vendor,
  allColumns.category,
  allColumns.spentCents,
  allColumns.recievedCents,
  allColumns.status,
  columnHelper.accessor("action", {
    id: "action",
  }),
];

const toClientColumns = [
  allColumns.date,
  allColumns.description,
  allColumns.vendor,
  allColumns.category,
  allColumns.spentCents,
  allColumns.recievedCents,
  allColumns.status,
  columnHelper.accessor("action", {
    id: "action",
  }),
];

const columnsMap = {
  Categorization: categorizationColumns,
  ToQuickBooks: toQuickBooksColumns,
  ToClient: toClientColumns,
};

const GET_TRANSACTIONS = gql(`
query Transactions($status: [Status!]!) {
  transactions(input: { status: $status }) {
    id
    lastUpdated
    date
    description
    vendor
    category
    spentCents
    recievedCents
    status
  }
}
`);

const statusMap = {
  Categorization: ["AutoCategorized"],
  ToQuickBooks: ["Approved", "ApprovedSyncedWithQuickBooks", "Excluded", "ExcludedSyncedWithQuickBooks"],
  ToClient: ["PendingSendToClient", "SentToClient", "ClientCommucationRecieved", "NeedsHumanApproval", "NeedsHumanReview"],
}

export default function Home() {
  const [currentTable, setCurrentTable] = useState<keyof typeof statusMap>("Categorization");
  const { loading, error, data } = useQuery(GET_TRANSACTIONS, { variables: { status: statusMap[currentTable] } });
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4">
          <button onClick={() => setCurrentTable("Categorization")}>Categorization</button>
          <button onClick={() => setCurrentTable("ToQuickBooks")}>To QuickBooks</button>
          <button onClick={() => setCurrentTable("ToClient")}>To Client</button>
        </div>

        <h1>{currentTable} Table</h1>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {!loading && !error && data && <DataTable columns={columnsMap[currentTable]} data={data.transactions} />}
      </main>
    </div>
  );
}
