import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

// TypeScript interface for route params
interface RouteParams {
  // In Next.js App Router, `context.params` can be a Promise that must be awaited.
  // Accept either a plain object or a Promise resolving to the object.
  params: { slug: string } | Promise<{ slug: string }>;
}

/**
 * GET handler to fetch event details by slug
 * @param request - Next.js request object
 * @param context - Route context containing dynamic params
 * @returns JSON response with event data or error message
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse> {
  try {
    // Extract slug from route parameters (context.params may be a Promise)
    const { slug } = (await context.params) as { slug: string };

    // Validate slug parameter
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    // Validate slug format (URL-friendly: lowercase, alphanumeric, hyphens only)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid slug format. Slug must be lowercase and URL-friendly",
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Query event by slug
    const event = await Event.findOne({ slug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      {
        message: "Event fetched successfully",
        success: true,
        data: event,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching event by slug:", error);

    // Return generic error response
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching the event",
      },
      { status: 500 }
    );
  }
}
