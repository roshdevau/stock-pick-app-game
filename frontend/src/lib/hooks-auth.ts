"use client";

import { useEffect, useState } from "react";
import { getUserGroups } from "@/lib/auth";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    getUserGroups().then((groups) => {
      if (alive) {
        setIsAdmin(groups.includes("Admin"));
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return isAdmin;
}
