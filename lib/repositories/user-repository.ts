import type { User } from "@/lib/auth-types";
import type { Subscription, Invoice } from "@/lib/types";

/**
 * User Repository
 * 
 * This layer abstracts user data access. Currently uses mock data,
 * but can be replaced with database queries or API calls.
 * 
 * To migrate to a real database:
 * 1. Replace mock data fetching with database queries
 * 2. Implement caching as needed
 * 3. Add error handling for DB failures
 * 4. Add transaction support for bulk operations
 */

export const userRepository = {
  /**
   * Get user by ID
   * @param userId - The user ID to fetch
   * @returns User object or null if not found
   */
  async getUserById(userId: string): Promise<User | null> {
    // TODO: Replace with database query
    // const user = await db.user.findUnique({ where: { id: userId } });
    
    // Mock implementation
    const stored = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
    if (stored) {
      const user = JSON.parse(stored);
      if (user.id === userId) return user;
    }
    return null;
  },

  /**
   * Get user by email
   * @param email - The user email to fetch
   * @returns User object or null if not found
   */
  async getUserByEmail(email: string): Promise<User | null> {
    // TODO: Replace with database query
    // const user = await db.user.findUnique({ where: { email } });
    
    const stored = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
    if (stored) {
      const user = JSON.parse(stored);
      if (user.email === email) return user;
    }
    return null;
  },

  /**
   * Create new user
   * @param userData - User data to create
   * @returns Created user object
   */
  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    // TODO: Replace with database query
    // const user = await db.user.create({ data: userData });
    
    const newUser: User = {
      ...userData,
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newUser;
  },

  /**
   * Update user
   * @param userId - The user ID to update
   * @param updates - Partial user data to update
   * @returns Updated user object
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    // TODO: Replace with database query
    // const user = await db.user.update({ where: { id: userId }, data: updates });
    
    const user = await this.getUserById(userId);
    if (!user) return null;
    
    const updated = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  },

  /**
   * Get user subscription
   * @param userId - The user ID
   * @returns Subscription object
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    // TODO: Replace with database query
    // const sub = await db.subscription.findUnique({ where: { userId } });
    
    const user = await this.getUserById(userId);
    if (!user) return null;
    
    return {
      id: `sub_${userId}`,
      planId: user.subscription.planId,
      planName: "Pro",
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      billingCycle: "monthly",
      trialEndsAt: user.subscription.trialEndsAt,
    };
  },

  /**
   * List all users (admin only)
   * @returns Array of users
   */
  async listUsers(limit = 50, offset = 0): Promise<User[]> {
    // TODO: Replace with database query
    // const users = await db.user.findMany({ take: limit, skip: offset });
    
    return [];
  },
};
