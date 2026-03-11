/**
 * Middleware Configuration & Documentation
 * 
 * This file demonstrates how to set up authentication middleware
 * once you integrate with a real auth provider (Auth0, Clerk, NextAuth.js, etc.)
 * 
 * CURRENT STATE: Using context-based client-side auth
 * NEXT STEP: Implement server-side middleware with auth provider
 */

// Example middleware structure for Next.js 16+

/**
 * EXAMPLE: Using NextAuth.js (for future implementation)
 * 
 * import { withAuth } from "next-auth/middleware";
 * 
 * export const middleware = withAuth({
 *   callbacks: {
 *     authorized({ token, req }) {
 *       // Check if user is authenticated and accessing protected route
 *       const protectedPaths = ["/dashboard", "/admin"];
 *       const adminPaths = ["/admin"];
 *       
 *       if (adminPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
 *         return token?.role === "admin";
 *       }
 *       
 *       if (protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
 *         return !!token;
 *       }
 *       
 *       return true;
 *     }
 *   }
 * });
 */

/**
 * EXAMPLE: Using Clerk (for future implementation)
 * 
 * import { clerkMiddleware } from "@clerk/nextjs/server";
 * 
 * export const middleware = clerkMiddleware();
 * 
 * export const config = {
 *   matcher: [
 *     "/((?!_next|sign-in|sign-up|public).*)",
 *   ],
 * };
 */

/**
 * EXAMPLE: Using Auth0 (for future implementation)
 * 
 * import { withApiAuthRequired } from "@auth0/nextjs-auth0";
 * 
 * export const middleware = withApiAuthRequired();
 * 
 * export const config = {
 *   matcher: ["/dashboard/:path*", "/admin/:path*", "/api/protected/:path*"]
 * };
 */

/**
 * PROTECTED ROUTES (TO BE WRAPPED WITH MIDDLEWARE)
 * 
 * Dashboard Routes:
 * - /dashboard/*
 * - /templates/* (POST/PUT)
 * - /billing/*
 * 
 * Admin Routes:
 * - /admin/*
 * - /api/admin/*
 * 
 * User Profile Routes:
 * - /settings/profile
 * - /settings/security
 */

/**
 * MIGRATION GUIDE
 * 
 * Step 1: Choose Auth Provider
 * - NextAuth.js (full-featured, database-backed)
 * - Clerk (managed auth SaaS)
 * - Auth0 (enterprise auth)
 * - MySQL-backed auth/session integration
 * 
 * Step 2: Install & Configure Provider
 * - Follow provider documentation
 * - Store credentials in environment variables
 * 
 * Step 3: Replace Context-Based Auth
 * - Keep AuthProvider for UI state
 * - Add provider's middleware
 * - Update API service to use provider's session
 * 
 * Step 4: Update Protected Routes
 * - Replace ProtectedRoute component with middleware
 * - Use provider's hooks (useSession, useUser, etc.)
 * - Add server-side route protection
 */

// CURRENT ROUTES THAT NEED PROTECTION
export const protectedRoutes = [
  "/dashboard",
  "/billing",
  "/settings",
  "/admin",
];

export const adminRoutes = ["/admin"];

export const publicRoutes = [
  "/",
  "/home",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/templates",
  "/pricing",
  "/privacy",
  "/terms",
  "/security",
];
