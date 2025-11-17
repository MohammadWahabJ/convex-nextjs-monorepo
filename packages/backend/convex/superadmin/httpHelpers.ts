import { ConvexError } from "convex/values";

// Helper function to handle errors
export function handleError(error: unknown) {
  console.error("HTTP Action Error:", error);
  
  if (error instanceof ConvexError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  return new Response(
    JSON.stringify({
      success: false,
      error: "Internal server error",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Helper function to validate required fields
export function validateRequiredFields(body: any, requiredFields: string[]) {
  const missingFields = requiredFields.filter(field => !body[field]);
  if (missingFields.length > 0) {
    throw new ConvexError(`Missing required fields: ${missingFields.join(", ")}`);
  }
}