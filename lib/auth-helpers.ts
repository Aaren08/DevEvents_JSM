import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Server-side helper to get current session
 * - Server Actions
 * - API Routes (that don't go through middleware)
 */

export const getServerSession = async () => {
  const session = await auth.api.getSession({
    headers: {
      cookie: (await cookies()).toString(),
    },
  });
  return session;
};

/**
 * Type-safe session user interface
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Check if user is authenticated
 * Returns user data if authenticated, null otherwise
 */
export const requireAuth = async (): Promise<SessionUser | null> => {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return null;
  }

  return session.user as SessionUser;
};
