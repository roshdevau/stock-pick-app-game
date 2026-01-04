"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession, getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    const checkSession = async () => {
      try {
        const session = await fetchAuthSession();
        const hasToken = Boolean(
          session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString()
        );
        if (!hasToken) {
          throw new Error("No session tokens");
        }
        await getCurrentUser();
        if (alive) {
          router.replace("/dashboard");
        }
      } catch (err) {
        if (alive) setChecking(false);
      }
    };

    const unsubscribe = Hub.listen("auth", () => {
      checkSession();
    });

    checkSession();
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!searchParams) return;
    const hasCode = Boolean(searchParams.get("code"));
    if (!hasCode) return;

    let alive = true;
    let attempts = 0;
    const maxAttempts = 20;

    const timer = setInterval(async () => {
      attempts += 1;
      try {
        const session = await fetchAuthSession();
        const hasToken = Boolean(
          session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString()
        );
        if (hasToken && alive) {
          clearInterval(timer);
          router.replace("/dashboard");
        }
      } catch (err) {
        // Keep polling briefly to allow OAuth completion.
      }
      if (attempts >= maxAttempts && alive) {
        clearInterval(timer);
        setChecking(false);
      }
    }, 500);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [router, searchParams]);

  if (checking) {
    return <LoadingScreen label="Loading sign in" />;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
      <div className="glass-card w-full rounded-3xl p-8">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Choose an account to access the Stock Pick Game. You can use email or a social provider.
        </p>
        <div className="mt-6">
          <Authenticator />
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)]"
            onClick={async () => {
              await signInWithRedirect({
                provider: "Google",
                options: {
                  prompt: "select_account",
                  scopes: ["openid", "email", "profile", "aws.cognito.signin.user.admin"],
                },
              });
            }}
            aria-label="Sign in with Google"
          >
            <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
              <path
                d="M44.5 20H24v8.5h11.8C34.6 34.9 29.9 38 24 38c-7.7 0-14-6.3-14-14s6.3-14 14-14c3.8 0 7.2 1.5 9.7 3.9l6-5.8C36.1 4 30.3 1 24 1 11.3 1 1 11.3 1 24s10.3 23 23 23c11.5 0 22-8.3 22-23 0-1.5-.2-2.7-.5-4z"
                fill="#FFC107"
              />
              <path
                d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.8 0 7.2 1.5 9.7 3.9l6-5.8C36.1 4 30.3 1 24 1 15.7 1 8.5 5.7 6.3 14.7z"
                fill="#FF3D00"
              />
              <path
                d="M24 47c6 0 11.6-2 15.5-5.6l-7.2-5.9C30.3 36.9 27.3 38 24 38c-5.8 0-10.8-3.9-12.5-9.3l-6.5 5C7.4 41.3 15.2 47 24 47z"
                fill="#4CAF50"
              />
              <path
                d="M44.5 20H24v8.5h11.8c-1.1 3-3.2 5.4-5.8 7l7.2 5.9C40.7 38.7 46 33.3 46 24c0-1.5-.2-2.7-.5-4z"
                fill="#1976D2"
              />
            </svg>
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)]"
            onClick={async () => {
              await signInWithRedirect({
                provider: "Facebook",
                options: {
                  scopes: ["email", "public_profile", "aws.cognito.signin.user.admin"],
                },
              });
            }}
            aria-label="Sign in with Facebook"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.05 3.67 9.24 8.47 10.06v-7.12H7.9v-2.94h2.43V9.41c0-2.4 1.43-3.73 3.62-3.73 1.05 0 2.14.19 2.14.19v2.36h-1.21c-1.2 0-1.57.75-1.57 1.52v1.82h2.67l-.43 2.94h-2.24v7.12c4.8-.82 8.47-5.01 8.47-10.06z"
                fill="#1877F2"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
