import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Protect create-event route
  if (request.nextUrl.pathname.startsWith("/create-event")) {
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!session?.user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create-event/:path*"],
};
