import { SignIn } from "@clerk/nextjs";

export const SignInView = () => {
  return (
    <SignIn
      routing="hash"
      redirectUrl="/"
      afterSignInUrl="/"
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-lg border",
        },
      }}
    />
  );
};
