"use client";

import { DataTable } from "@/design-system/data-table/DataTable.component";
import { ApolloProvider, gql, useQuery } from "@apollo/client";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";

type Column = {
  id: String;
  date: Date;
  description: String;
  vendor: String;
  category: String;
  spentCents: Number;
  recievedCents: Number;
  status: String;
  action: String;
  selectedCategory?: string;
  selectedVendor?: string;
};
const columnHelper = createColumnHelper<Column>();

type CategoryColumnProps = {
  setSelectedCategory(transactionId: string, category: string): void;
};
const getCategoryColumn = ({ setSelectedCategory }: CategoryColumnProps) => {
  return columnHelper.accessor("category", {
    id: "category",
    cell: ({ cell }) => {
      const selectedCategory = cell.row.original.selectedCategory?.toString();
      const currentValue: string =
        selectedCategory || cell.getValue().toString();
      return (
        <select
          value={currentValue}
          onChange={(e) =>
            setSelectedCategory(cell.row.original.id.toString(), e.target.value)
          }
        >
          <option key={currentValue} value={currentValue}>
            {currentValue}
          </option>
          <option key={"fsdafdsfs"} value={"Sales"}>
            Sales
          </option>
          <option key={"adfasf"} value={"Travel"}>
            Travel
          </option>
        </select>
      );
    },
  });
};

type VendorColumnProps = {
  setSelectedVendor(transactionId: string, vendor: string): void;
};
const getVendorColumn = ({ setSelectedVendor }: VendorColumnProps) => {
  return columnHelper.accessor("vendor", {
    id: "vendor",
    cell: ({ cell }) => {
      const selectedVendor = cell.row.original.selectedVendor?.toString();
      const currentValue: string = selectedVendor || cell.getValue().toString();
      return (
        <select
          value={currentValue}
          onChange={(e) =>
            setSelectedVendor(cell.row.original.id.toString(), e.target.value)
          }
        >
          <option key={currentValue} value={currentValue}>
            {currentValue}
          </option>
          <option key={"fsdafdsfs"} value={"Uber"}>
            Uber
          </option>
          <option key={"adfasf"} value={"Merchant BankCD"}>
            Merchant BankCD
          </option>
        </select>
      );
    },
  });
};

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
  spentCents: columnHelper.accessor("spentCents", {
    id: "spent",
    cell: ({ cell }) => {
      const value = Number(cell.getValue());
      return value === 0
        ? ""
        : Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(value / 100);
    },
  }),
  recievedCents: columnHelper.accessor("recievedCents", {
    id: "recieved",
    cell: ({ cell }) => {
      const value = Number(cell.getValue());
      return value === 0
        ? ""
        : Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(value / 100);
    },
  }),
  status: columnHelper.accessor("status", {
    id: "status",
  }),
};

const categorizationColumns = [
  allColumns.date,
  allColumns.description,
  allColumns.spentCents,
  allColumns.recievedCents,
  columnHelper.accessor("action", {
    id: "action",
  }),
];

const toQuickBooksColumns = [
  allColumns.date,
  allColumns.description,
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
  ToQuickBooks: [
    "Approved",
    "ApprovedSyncedWithQuickBooks",
    "Excluded",
    "ExcludedSyncedWithQuickBooks",
  ],
  ToClient: [
    "PendingSendToClient",
    "SentToClient",
    "ClientCommucationRecieved",
    "NeedsHumanApproval",
    "NeedsHumanReview",
  ],
};

export default function Home() {
  const [currentTable, setCurrentTable] =
    useState<keyof typeof statusMap>("Categorization");
  const { loading, error, data } = useQuery(GET_TRANSACTIONS, {
    variables: { status: statusMap[currentTable] },
  });

  const [selectedCategories, setSelectedCategories] = useState<
    Record<string, string>
  >({});
  const [selectedVendors, setSelectedVendors] = useState<
    Record<string, string>
  >({});

  const setSelectedCategory = (transactionId: string, category: string) => {
    setSelectedCategories((prevCategories) => {
      const updatedMap = { ...prevCategories };
      updatedMap[transactionId] = category;
      return updatedMap;
    });
  };
  const setSelectedVendor = (transactionId: string, vendor: string) => {
    setSelectedVendors((prevVendors) => {
      const updatedMap = { ...prevVendors };
      updatedMap[transactionId] = vendor;
      return updatedMap;
    });
  };

  const categoryColumn = getCategoryColumn({
    setSelectedCategory,
  });
  const vendorColumn = getVendorColumn({
    setSelectedVendor,
  });
  const columns = columnsMap[currentTable];
  const updatedColumns = useMemo(() => {
    return [...columns, categoryColumn, vendorColumn];
  }, [columns]);
  const transactions = (data?.transactions ?? []).map((transaction: any) => {
    return {
      ...transaction,
      selectedCategory: selectedCategories[transaction.id],
      selectedVendor: selectedVendors[transaction.id],
    };
  });
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4">
          <button onClick={() => setCurrentTable("Categorization")}>
            Categorization
          </button>
          <button onClick={() => setCurrentTable("ToQuickBooks")}>
            To QuickBooks
          </button>
          <button onClick={() => setCurrentTable("ToClient")}>To Client</button>
        </div>

        <h1>{currentTable} Table</h1>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {!loading && !error && data && (
          <DataTable columns={updatedColumns} data={transactions} />
        )}
      </main>
    </div>
  );
}
