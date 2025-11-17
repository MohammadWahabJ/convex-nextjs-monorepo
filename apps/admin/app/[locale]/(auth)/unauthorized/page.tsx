"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";

export default function Unauthorized() {
  return (
    <div className="flex w-full h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Welcome!</h1>
        <div className="text-gray-700 mb-8 space-y-4">
          <p className="font-medium text-green-600">
            Thank you for accepting our invitation!
          </p>
          <p>
            Your access to the admin panel is currently being processed. This
            may take up to 24 hours to complete.
          </p>
          <p>
            If you need immediate access or have any questions, please contact
            your administrator.
          </p>
          <p className="text-sm text-gray-500">
            We appreciate your patience as we set up your account with the
            appropriate permissions.
          </p>
        </div>

        <SignOutButton>
          <Button variant={"destructive"}>Sign Out</Button>
        </SignOutButton>
      </div>
    </div>
  );
}
