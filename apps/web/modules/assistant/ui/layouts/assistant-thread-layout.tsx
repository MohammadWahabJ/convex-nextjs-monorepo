"use client";

import { ReactNode } from "react";

export const AssistantThreadLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <div className="h-full flex flex-col">{children}</div>;
};
