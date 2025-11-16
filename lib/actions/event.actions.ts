"use server";

import Event, { IEvent } from "@/database/event.model";
import connectDB from "../mongodb";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * Pagination response interface for events
 */
export interface PaginatedEventsResponse {
  events: IEvent[];
  totalEvents: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Fetch events created by the authenticated user with pagination
 * @param page - Current page number (1-indexed)
 * @param limit - Number of events per page
 * @returns Promise<PaginatedEventsResponse | null>
 */
export const getUserCreatedEvents = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedEventsResponse | null> => {
  try {
    // Verify user authentication
    const user = await requireAuth();

    if (!user) {
      return null;
    }

    await connectDB();

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch events created by the user with pagination
    const [events, totalEvents] = await Promise.all([
      Event.find({ creatorId: user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments({ creatorId: user.id }),
    ]);

    const totalPages = Math.ceil(totalEvents / limit);

    return {
      events: events as unknown as IEvent[],
      totalEvents,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch user events:", error);
    return null;
  }
};

/**
 * Get a single event by ID (with ownership verification)
 * @param eventId - The event ID
 * @returns Promise<IEvent | null>
 */
export const getUserEvent = async (eventId: string): Promise<IEvent | null> => {
  try {
    const user = await requireAuth();

    if (!user) {
      return null;
    }

    await connectDB();

    const event = await Event.findOne({
      _id: eventId,
      creatorId: user.id,
    }).lean();

    return event as IEvent | null;
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return null;
  }
};

// Get similar events based on tags, excluding the event with the given slug
export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectDB();
    const event = await Event.findOne({ slug });
    const similarEvents = await Event.find({
      _id: { $ne: event?._id },
      tags: { $in: event?.tags },
    }).lean();
    return similarEvents;
  } catch {
    return [];
  }
};
