"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
  fallback?: React.ReactNode;
}

/**
 * Protected Route Component
 * Wraps pages/components that require authentication
 * Redirects to login if user is not authenticated
 * Blocks access if user lacks required role
 */
export function ProtectedRoute({
  children,
  requiredRole = "user",
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Check if user has required role
    if (requiredRole === "admin" && user?.role !== "admin") {
      router.push("/403");
      return;
    }
  }, [isAuthenticated, isLoading, requiredRole, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  if (requiredRole === "admin" && user?.role !== "admin") {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Admin Only Route Wrapper
 * Shorthand for ProtectedRoute with admin role requirement
 */
export function AdminRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}
