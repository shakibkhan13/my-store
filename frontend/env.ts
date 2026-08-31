// lib/env.ts
export type EnvType = {
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_MODE: string;
  NEXT_PUBLIC_INTEAGRATION_CLIENT_ID: string;
  NEXT_PUBLIC_INTEAGRATION_EXTERNAL_ID: string;
  NEXT_PUBLIC_VERSION: string;
  MODE: string;
};

declare global {
  interface Window {
    env?: Partial<EnvType>;
  }
}

export const getEnv = (): EnvType => {
  const buildEnv = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
    NEXT_PUBLIC_MODE: process.env.NEXT_PUBLIC_MODE ?? "",
    NEXT_PUBLIC_INTEAGRATION_CLIENT_ID:
      process.env.NEXT_PUBLIC_INTEAGRATION_CLIENT_ID ?? "",
    NEXT_PUBLIC_INTEAGRATION_EXTERNAL_ID:
      process.env.NEXT_PUBLIC_INTEAGRATION_EXTERNAL_ID ?? "",
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION ?? "",
    MODE: process.env.NODE_ENV,
  };

  if (typeof window !== "undefined" && process.env.NODE_ENV !== "development") {
    return {
      ...buildEnv,
      ...window.env,
    };
  }

  return buildEnv;
};

export const IS_PROXY = process.env.NEXT_PUBLIC_IS_PROXY === "true";
