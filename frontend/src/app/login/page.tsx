"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await getCurrentUser();
        if (alive) {
          router.replace("/dashboard");
        }
      } catch (err) {
        if (alive) setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [router]);

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
        <div className="mt-4 flex justify-center">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--card-border)]"
            onClick={async () => {
              try {
                await signInWithRedirect({ provider: "Google" });
              } catch (err) {
                router.replace("/dashboard");
              }
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
        </div>
      </div>
    </div>
  );
}
