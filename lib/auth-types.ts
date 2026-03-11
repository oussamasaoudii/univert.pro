// ============================================================================
// AUTHENTICATION TYPES AND SESSION MANAGEMENT
// ============================================================================

export type UserRole = "user" | "admin";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  subscription: {
    status: SubscriptionStatus;
    planId: string;
    currentPeriodEnd: string;
    trialEndsAt?: string;
    canceledAt?: string;
  };
  profile: {
    company?: string;
    timezone?: string;
    preferences?: Record<string, any>;
  };
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface PasswordReset {
  token: string;
  password: string;
}
