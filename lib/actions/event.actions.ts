"use server";

import Event from "@/database/event.model";
import connectDB from "../mongodb";

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
