import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server-side helper to get current session
 * Use this in server components, server actions, and API routes
 */
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

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
export async function requireAuth(): Promise<SessionUser | null> {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return null;
  }
  
  return session.user as SessionUser;
}
