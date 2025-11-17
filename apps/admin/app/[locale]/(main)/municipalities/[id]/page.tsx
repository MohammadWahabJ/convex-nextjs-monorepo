"use client";

import { MunicipalityDetailsView } from "@/modules/municipality/ui/municipalityDetailsView";
import { Authenticated, Unauthenticated } from "convex/react";
import React from "react";

interface Params {
  id: string;
}

export default function MunicipalityDetails({
  params,
}: {
  params: Promise<Params>;
}) {
  const resolvedParams = React.use(params);

  return (
    <>
      <Authenticated>
        <MunicipalityDetailsView municipalityId={resolvedParams.id} />
      </Authenticated>
      <Unauthenticated>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Municipality Details</h2>
          <div className="text-sm text-gray-500">
            Please sign in to view this page
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
