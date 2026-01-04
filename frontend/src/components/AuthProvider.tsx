"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { configureAmplify } from "@/lib/amplify";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

type AuthState = {
  checking: boolean;
  signedIn: boolean;
  userName: string;
  userId: string;
  isConfigured: boolean;
  refresh: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      checking: false,
      signedIn: false,
      userName: "Player",
      userId: "",
      isConfigured: false,
      refresh: () => {},
    };
  }
  return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [userName, setUserName] = useState("Player");
  const [userId, setUserId] = useState("");
  const isConfigured = useMemo(
    () =>
      Boolean(
        process.env.NEXT_PUBLIC_AUTH_MODE &&
          process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
          process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
      ),
    []
  );

  useEffect(() => {
    configureAmplify();
  }, []);

  const refresh = useCallback(async () => {
    if (!isConfigured) {
      setSignedIn(false);
      setUserName("Player");
      setChecking(false);
      return;
    }

    setChecking(true);
    try {
      const session = await fetchAuthSession();
      const hasToken = Boolean(
        session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString()
      );
      if (!hasToken) {
        throw new Error("No session tokens");
      }
      const user = await getCurrentUser();
      const payload = session.tokens?.idToken?.payload as Record<string, unknown> | undefined;
      const name =
        (payload?.email as string | undefined) ||
        (payload?.["cognito:username"] as string | undefined) ||
        user.username ||
        "Player";
      const sub = (payload?.sub as string | undefined) || "";
      setSignedIn(true);
      setUserName(name);
      setUserId(sub);
    } catch (err) {
      setSignedIn(false);
      setUserName("Player");
      setUserId("");
    } finally {
      setChecking(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    let alive = true;
    const guardedRefresh = async () => {
      if (!alive) return;
      await refresh();
    };

    const unsubscribe = Hub.listen("auth", () => {
      guardedRefresh();
    });

    guardedRefresh();

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      checking,
      signedIn,
      userName,
      userId,
      isConfigured,
      refresh,
    }),
    [checking, signedIn, userName, userId, isConfigured, refresh]
  );

  if (!isConfigured) {
    return <>{children}</>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
