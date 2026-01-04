"use client";

import { useEffect, useState } from "react";
import { configureAmplify } from "@/lib/amplify";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    configureAmplify();
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
