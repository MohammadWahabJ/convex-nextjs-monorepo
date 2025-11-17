"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { MunicipalityView } from "@/modules/municipality/ui/municipalityView";

function Page() {
  return (
    <>
      <Unauthenticated>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Municipalities</h2>
          <div className="text-sm text-gray-500">
            Please sign in to view this page
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <MunicipalityView />
      </Authenticated>
    </>
  );
}

export default Page;
