/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import {
  Authenticated,
  Unauthenticated,
  useAction,
  useQuery,
} from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const Card = ({
  title,
  value,
  href,
}: {
  title: string;
  value: string;
  href: string;
}) => (
  <Link href={href}>
    <div className="rounded-lg border p-6 transition-colors hover:bg-muted">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{value}</p>
    </div>
  </Link>
);

function AuthenticatedContent() {
  const [usersData, setUsersData] = useState<any>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const getUsersCount = useAction(api.superadmin.users.getUsersCount);
  const organizationsData = useQuery(
    api.superadmin.organization.getAllOrganizationsWithRole,
    { activeOnly: true }
  );

  const getAllFeedbacks = useQuery(api.superadmin.feedback.getAllFeedbacks, {
    status: "open",
  });

  const assistants = useQuery(api.superadmin.assistant.getAllAssistants);
  const departments = useQuery(api.superadmin.department.getAllDepartments);
  const tools = useQuery(api.superadmin.tools.getAllTools);

  // Fetch users count on component mount
  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        setIsLoadingUsers(true);
        const result = await getUsersCount();
        setUsersData(result);
      } catch (error) {
        console.error("Error fetching users count:", error);
        setUsersData({
          success: false,
          error: "Failed to load users count",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsersCount();
  }, [getUsersCount]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {getGreeting()}! Welcome to Super Admin
        </h2>
        <p className="text-muted-foreground">
          Manage your application settings and data
        </p>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-semibold text-xl">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Total Organization"
            value={
              organizationsData === undefined
                ? "Loading..."
                : organizationsData?.success
                  ? String(organizationsData.totalCount)
                  : "Error loading"
            }
            href="/municipalities"
          />
          <Card
            title="Total Assistant"
            value={String(assistants?.length || 0)}
            href="/assistants"
          />
          <Card
            title="Total Tools"
            value={String(tools?.length || 0)}
            href="/tools"
          />
          <Card title="Total Conversations" value="---" href="" />
          <Card title="Total Token uses" value="---" href="" />
          <Card title="Total Requests" value="---" href="" />
          <Card
            title="Total Departments"
            value={String(departments?.length || 0)}
            href=""
          />

          <Card
            title="Total Users"
            value={
              isLoadingUsers
                ? "Loading..."
                : usersData?.success
                  ? String(usersData.count)
                  : "Error loading"
            }
            href=""
          />
          <Card
            title="Total Pending Feedback"
            value={
              getAllFeedbacks === undefined
                ? "Loading..."
                : getAllFeedbacks
                  ? String(
                      getAllFeedbacks.filter(
                        (feedback) => feedback.status === "open"
                      ).length
                    )
                  : "Error loading"
            }
            href=""
          />
        </div>
      </div>
    </div>
  );
}

function Page() {
  return (
    <div className="p-4">
      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">apps/admin</h2>
          <div className="text-sm text-gray-500">
            Please sign in to view this page
          </div>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </Unauthenticated>
    </div>
  );
}

export default Page;
