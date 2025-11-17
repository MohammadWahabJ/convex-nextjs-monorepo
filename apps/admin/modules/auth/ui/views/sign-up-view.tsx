"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export const SignUpView = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <SignUp
      routing="hash"
      redirectUrl={redirectUrl}
      afterSignUpUrl={redirectUrl}
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-lg border",
        },
      }}
    />
  );
};
