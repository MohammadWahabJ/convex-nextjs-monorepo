"use client";
import React from "react";
import { columns } from "../columns";
import FilterTable from "@workspace/ui/components/table/FilterTable";
import { useQuery } from "convex/react";

import { useAuth } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";

const HistoryTable = () => {
  const { userId } = useAuth();
  
  const threads = useQuery(
    api.web.history.listThreadsByUserId,
    userId ? { userId } : "skip"
  );

  const data =
    threads?.map((thread) => ({
      id: thread._id,

      title: thread.title,

      updatedAt: new Date(thread._creationTime).toLocaleDateString(),

      assistantName: thread.assistantName,
    })) ?? [];

  console.log(data, "datadata");

  if (!threads) {
    return <div>Loading...</div>;
  }

  return <FilterTable data={data} columns={columns} filterColumn="title" />;
};

export default HistoryTable;
