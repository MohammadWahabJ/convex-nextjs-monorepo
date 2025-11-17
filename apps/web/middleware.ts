import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "@workspace/i18n";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/(.*)",
]);

const intlMiddleware = createMiddleware(routing);

const isOrgFreeRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/org-selection(.*)",
]);

const isAdminOnlyRoute = createRouteMatcher([
  "/:locale/widget-settings(.*)",
  "/widget-settings(.*)",
  "/:locale/integrations(.*)",
  "/integrations(.*)",
  "/:locale/department(.*)",
  "/department(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth();

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (userId && !orgId && !isOrgFreeRoute(req)) {
    const searchParams = new URLSearchParams({ redirectUrl: req.url });

    const orgSelection = new URL(
      `/org-selection?${searchParams.toString()}`,
      req.url
    );

    return NextResponse.redirect(orgSelection);
  }

  // Check if user is trying to access admin-only routes
  if (userId && orgId && isAdminOnlyRoute(req)) {
    // Check if user is not an admin
    if (orgRole !== "org:admin") {
      // Redirect to dashboard or show unauthorized page
      const locale = req.nextUrl.pathname.split('/')[1]; // Extract locale
      const dashboardUrl = new URL(`/${locale}/assistant`, req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
