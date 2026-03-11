"use client";

import { useEffect, useState } from "react";

export type CurrentSessionUser = {
  id: string;
  email: string;
  role: "user" | "admin";
};

export function useCurrentSessionUser(defaultRole: "user" | "admin" = "user") {
  const [user, setUser] = useState<CurrentSessionUser | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (defaultRole === "admin") {
          params.set("scope", "admin");
        }

        const response = await fetch(
          `/api/auth/me${params.toString() ? `?${params.toString()}` : ""}`,
          {
            cache: "no-store",
            credentials: "include",
          },
        );

        if (!response.ok) {
          if (mounted) {
            setUser(null);
          }
          return;
        }

        const data = (await response.json()) as Partial<CurrentSessionUser>;
        if (!mounted || !data.email || !data.role || !data.id) {
          if (mounted) {
            setUser(null);
          }
          return;
        }

        setUser({
          id: data.id,
          email: data.email,
          role: data.role,
        });
      } catch (error) {
        console.error("[useCurrentSessionUser] Failed to load current user", error);
        if (mounted) {
          setUser(null);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [defaultRole]);

  return user;
}
