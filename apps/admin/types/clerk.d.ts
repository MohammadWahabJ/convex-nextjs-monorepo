// Custom types for Clerk session claims
export interface CustomSessionClaims {
  publicMetadata?: {
    managementRole?: string;
    countryCode?: string;
  };
}

// Global type augmentation for Clerk
declare global {
  interface CustomJwtSessionClaims {
    publicMetadata?: {
      managementRole?: string;
      countryCode?: string;
    };
  }
}

export {};