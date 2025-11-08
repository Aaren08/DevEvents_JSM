"use server";

import Booking from "@/database/booking.model";
import connectDB from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

/**
 * Get the number of bookings for a specific event
 * @param eventId - The event ID to get booking count for
 * @returns Promise<number> - Number of bookings
 */
export const getBookingCount = async (eventId: string): Promise<number> => {
  try {
    await connectDB();
    const count = await Booking.getBookingCountByEventId(eventId);
    return count;
  } catch (error) {
    console.error("Failed to get booking count:", error);
    return 0;
  }
};

/**
 * Create a new booking for an event
 * Requires user authentication
 */
export const createBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: string;
  slug: string;
  email: string;
}) => {
  try {
    // Verify user is authenticated
    const user = await requireAuth();

    if (!user) {
      return {
        success: false,
        message: "Please sign in to book an event",
        requiresAuth: true,
      };
    }

    await connectDB();

    // Check if user already booked this event
    const existingBooking = await Booking.findOne({ eventId, email });
    if (existingBooking) {
      return {
        success: false,
        message: "You have already booked this event",
        requiresAuth: false,
      };
    }

    await Booking.create({ eventId, email });

    // Revalidate the event page to update booking count
    revalidatePath(`/events/${slug}`);

    return {
      success: true,
      message: "Booking successful!",
      requiresAuth: false,
    };
  } catch (error) {
    console.error("Booking creation failed", error);
    return {
      success: false,
      message: "Failed to create booking. Please try again.",
      requiresAuth: false,
    };
  }
};
