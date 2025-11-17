import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "@workspace/i18n/middleware";
import { routing } from "@workspace/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/api/webhooks(.*)",
  "/unauthorized(.*)", // Add unauthorized route as public
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
  "/:locale/unauthorized(.*)", // Add localized unauthorized routes
  "/en/sign-in(.*)",
  "/en/sign-up(.*)",
  "/en/unauthorized(.*)",
  "/de/sign-in(.*)",
  "/de/sign-up(.*)",
  "/de/unauthorized(.*)",
]);

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // First handle i18n
  const intlResponse = intlMiddleware(req);
  // If i18n middleware returns a response (redirect), return it
  if (intlResponse && intlResponse.status !== 200) {
    return intlResponse;
  }

  // Then handle auth protection for non-public routes
  if (!isPublicRoute(req)) {
    try {
      const authResult = await auth();
      // console.log(authResult);

      // If user is not logged in, redirect to sign-in
      if (!authResult?.userId) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }

      // User is logged in, now check management role privileges
      const managementRole = authResult?.sessionClaims?.publicMetadata?.managementRole;
      
      // Allow access for both super_admin and moderator roles
      if (managementRole !== "super_admin" && managementRole !== "moderator") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // Additional check for moderator restricted pages
      if (managementRole === "moderator") {
        const pathname = req.nextUrl.pathname;
        const restrictedPaths = ["/users", "/tools"];
        
        // Check if the pathname (without locale) matches restricted paths
        const pathWithoutLocale = `/${pathname.split("/").slice(2).join("/")}`;
        
        if (restrictedPaths.some(path => pathWithoutLocale.startsWith(path))) {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }

      // User is logged in and has management role, protect the route
      await auth.protect();
    } catch (error) {
      console.log("Auth Error:", error);
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // Return the i18n response or continue
  return intlResponse || NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
