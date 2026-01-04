"use client";

import { getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const isAuthConfigured = Boolean(
    process.env.NEXT_PUBLIC_AUTH_MODE &&
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
  );

  if (!isAuthConfigured) {
    return <>{children}</>;
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await getCurrentUser();
        if (alive) {
          setSignedIn(true);
        }
      } catch (err) {
        if (alive) {
          setSignedIn(false);
        }
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (ready && !signedIn) {
      router.replace("/");
    }
  }, [ready, signedIn, router]);

  if (!ready) {
    return <LoadingScreen label="Checking session" />;
  }

  if (!signedIn) {
    return null;
  }

  return <>{children}</>;
}
