"use client"

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { AdminAuthLayout } from "../layouts/auth-layout";
import { SignInView } from "../views/sign-in-view";
import { SplashScreenLoading } from "@workspace/ui/components/splash-screen-loading";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthLoading>
        <SplashScreenLoading />
      </AuthLoading>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <AdminAuthLayout>
          <SignInView />
        </AdminAuthLayout>
      </Unauthenticated>
    </>
  );
};
