"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/components/AuthProvider";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { signedIn, checking, isConfigured } = useAuth();
  const isAuthConfigured = Boolean(
    process.env.NEXT_PUBLIC_AUTH_MODE &&
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
  );

  if (!isAuthConfigured || !isConfigured) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!checking && !signedIn) {
      router.replace("/");
    }
  }, [checking, signedIn, router]);

  if (checking) {
    return <LoadingScreen label="Checking session" />;
  }

  if (!signedIn) {
    return null;
  }

  return <>{children}</>;
}
