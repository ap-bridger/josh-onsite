"use client";

import { DataTable } from "@/design-system/data-table/DataTable.component";
import { ApolloProvider, gql, useMutation, useQuery } from "@apollo/client";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";

const SEND_TRANSACTION_NOTIFICATION = gql(`
mutation SendTransactionNotification($ids: [String!]!, $content: String!) {
  sendTransactionNotification(ids: $ids, content: $content)
}
  `);

const SEND_TRANSACTION_TO_CLIENT = gql(`
mutation SendTransactionToClient($id: String!) {
  sendTransactionToClient(id: $id) {
    id
  }
}
`);

const ADD_TRANSACTION = gql(`
mutation AddTransaction($id: String!, $vendor: String!, $category: String!) {
  approveTransaction(id: $id, vendor: $vendor, category: $category) {
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
  allVendors?: string[];
  allCategories?: string[];
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
      const options = cell.row.original.allCategories?.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ));
      return (
        <select
          value={currentValue}
          onChange={(e) =>
            setSelectedCategory(cell.row.original.id.toString(), e.target.value)
          }
        >
          {options}
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
      const options = cell.row.original.allVendors?.map((vendor) => (
        <option key={vendor} value={vendor}>
          {vendor}
        </option>
      ));
      return (
        <select
          value={currentValue}
          onChange={(e) =>
            setSelectedVendor(cell.row.original.id.toString(), e.target.value)
          }
        >
          {options}
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
    cell: ({ row }) => {
      return <div>
        <AddTransactionButton transactionInfo={{transactionId: row.original.id.toString(), category: row.original.selectedCategory?.toString() || row.original.category.toString(), vendor: row.original.selectedVendor?.toString() || row.original.vendor.toString()}}/>
        <p> </p>
        <RequestInfoButton transactionId={row.original.id.toString()} />
        </div>;
    },
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
  getAllVendors
  getAllCategories
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

  const vendors = data?.getAllVendors ?? [];
  const categories = data?.getAllCategories ?? [];

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
      allVendors: vendors,
      allCategories: categories,
    };
  });
  const pendingTransactionIds = transactions
    .filter(
      (transaction: Column) => transaction.status === "PendingSendToClient"
    )
    .map((transaction: Column) => transaction.id);
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
        <div className="flex flex-row gap-8">
          <h1>{currentTable} Table</h1>
          {currentTable == "ToClient" && (
            <GenerateNotificationButton
              pendingTransactionIds={pendingTransactionIds}
            />
          )}
        </div>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {!loading && !error && data && (
          <DataTable columns={updatedColumns} data={transactions} />
        )}
      </main>
    </div>
  );
}

type AddTransactionButtonProps = {
  transactionId: string;
  vendor: string;
  category: string;
};

const AddTransactionButton = ({ transactionInfo }: { transactionInfo: AddTransactionButtonProps }) => {
  const [sendTransactionToClient, {}] = useMutation(ADD_TRANSACTION, {
    variables: {
      id: transactionInfo.transactionId,
      vendor: transactionInfo.vendor,
      category: transactionInfo.category,
    },
    onCompleted: (result) => {
      alert(JSON.stringify(result));
    },
    onError: (error) => {
      alert(JSON.stringify(error));
    },
    refetchQueries: [GET_TRANSACTIONS],
  });
  return (
    <button 
    style={{ textDecoration: "underline" }}
    onClick={() => sendTransactionToClient()}>Add</button>
  );
};

type GenerateNotificationButtonProps = {
  pendingTransactionIds: String[];
};
const GenerateNotificationButton = ({
  pendingTransactionIds,
}: GenerateNotificationButtonProps) => {
  const [sendTransactionNotification, {}] = useMutation(
    SEND_TRANSACTION_NOTIFICATION,
    {
      variables: {
        content: "hi",
        ids: pendingTransactionIds,
      },
      onCompleted: (result) => {
        alert(JSON.stringify(result));
      },
      onError: (error) => {
        alert(JSON.stringify(error));
      },
      refetchQueries: [GET_TRANSACTIONS],
    }
  );
  return (
    <button 
    onClick={() => sendTransactionNotification()}>
      Send to Client
    </button>
  );
};

type RequestInfoButtonProps = {
  transactionId: string;
};
const RequestInfoButton = ({ transactionId }: RequestInfoButtonProps) => {
  const [sendTransactionToClient, {}] = useMutation(
    SEND_TRANSACTION_TO_CLIENT,
    {
      variables: {
        id: transactionId,
      },
      onCompleted: (result) => {
        alert(JSON.stringify(result));
      },
      onError: (error) => {
        alert(JSON.stringify(error));
      },
      refetchQueries: [GET_TRANSACTIONS],
    }
  );
  return (
    <button
      style={{ textDecoration: "underline" }}
      onClick={() => sendTransactionToClient()}
    >
      Request Info
    </button>
  );
};
