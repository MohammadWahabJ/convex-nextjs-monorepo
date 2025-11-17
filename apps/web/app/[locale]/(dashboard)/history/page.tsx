"use client";
import React from "react";
import HistoryTable from "@/modules/history/ui/history-table";

const HistoryPage = () => {
  return (
    <div className="h-full w-full">
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-sm text-gray-500">
          Here you can see all the chat history.
        </p>
      </div>
      <div className="p-4 sm:p-6">
        <HistoryTable />
      </div>
    </div>
  );
};

export default HistoryPage;
