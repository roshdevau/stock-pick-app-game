"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";

export default function AuthStatus() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const isAuthConfigured = Boolean(
    process.env.NEXT_PUBLIC_AUTH_MODE &&
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID
  );

  if (!isAuthConfigured) {
    return (
      <div className="glass-card mt-6 rounded-2xl px-4 py-3 text-sm text-[var(--muted)]">
        Auth not configured. Connect Cognito to enable sign-in.
      </div>
    );
  }

  return (
    <div className="glass-card mt-6 rounded-2xl px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>Signed in as {user?.username}</span>
        <button
          className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold"
          onClick={signOut}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
