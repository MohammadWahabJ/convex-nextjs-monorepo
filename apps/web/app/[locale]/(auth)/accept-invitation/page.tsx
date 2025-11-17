"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const ticket = searchParams.get("__clerk_ticket"); 

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
      <SignUp
        signInUrl="/sign-in"
      />
    </div>
  );
}
