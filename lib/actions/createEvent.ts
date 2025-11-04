"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";

// Type for the form state returned by the action
export interface CreateEventState {
  success: boolean;
  message: string;
  errors?: {
    title?: string;
    date?: string;
    time?: string;
    venue?: string;
    eventType?: string;
    image?: string;
    tags?: string;
    description?: string;
    overview?: string;
    location?: string;
    mode?: string;
    audience?: string;
    agenda?: string;
    organizer?: string;
  };
}

/**
 * Server action to create a new event
 * Processes FormData, validates input, uploads image, and saves to MongoDB
 */
export async function createEventAction(
  prevState: CreateEventState | null,
  formData: FormData
): Promise<CreateEventState> {
  try {
    // Extract form data
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const venue = formData.get("venue") as string;
    const eventType = formData.get("eventType") as string;
    const image = formData.get("image") as File;
    const tags = formData.get("tags") as string;
    const description = formData.get("description") as string;
    const overview = formData.get("overview") as string;
    const location = formData.get("location") as string;
    const mode = formData.get("mode") as string;
    const audience = formData.get("audience") as string;
    const agenda = formData.get("agenda") as string;
    const organizer = formData.get("organizer") as string;

    // Validation errors object
    const errors: CreateEventState["errors"] = {};

    // Validate required fields
    if (!title?.trim()) {
      errors.title = "Event title is required";
    }
    if (!date) {
      errors.date = "Event date is required";
    }
    if (!time) {
      errors.time = "Event time is required";
    }
    if (!venue?.trim()) {
      errors.venue = "Venue is required";
    }
    if (!eventType || eventType === "Select event type") {
      errors.eventType = "Event type is required";
    }
    if (!image || image.size === 0) {
      errors.image = "Event image is required";
    }
    if (!tags?.trim()) {
      errors.tags = "At least one tag is required";
    }
    if (!description?.trim()) {
      errors.description = "Event description is required";
    }
    if (!overview?.trim()) {
      errors.overview = "Event overview is required";
    }
    if (!location?.trim()) {
      errors.location = "Location is required";
    }
    if (!mode?.trim()) {
      errors.mode = "Event mode is required";
    }
    if (!audience?.trim()) {
      errors.audience = "Target audience is required";
    }
    if (!agenda?.trim()) {
      errors.agenda = "Event agenda is required";
    }
    if (!organizer?.trim()) {
      errors.organizer = "Organizer name is required";
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Please fill in all required fields",
        errors,
      };
    }

    // Validate image file
    if (image.size > 5 * 1024 * 1024) {
      // 5MB limit
      return {
        success: false,
        message: "Image file size must be less than 5MB",
        errors: { image: "File size must be less than 5MB" },
      };
    }

    if (!image.type.startsWith("image/")) {
      return {
        success: false,
        message: "Only image files are allowed",
        errors: { image: "Only image files are allowed" },
      };
    }

    // Connect to database
    await connectDB();

    // Parse tags and agenda
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    const agendaArray = agenda
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (tagsArray.length === 0) {
      return {
        success: false,
        message: "At least one tag is required",
        errors: { tags: "At least one tag is required" },
      };
    }

    if (agendaArray.length === 0) {
      return {
        success: false,
        message: "At least one agenda item is required",
        errors: { agenda: "At least one agenda item is required" },
      };
    }

    // Combine date and time into eventStartAt
    const eventStartAt = new Date(`${date}T${time}`);
    if (isNaN(eventStartAt.getTime())) {
      return {
        success: false,
        message: "Invalid date or time format",
        errors: { date: "Invalid date or time" },
      };
    }

    // Upload image using the existing API endpoint
    const uploadFormData = new FormData();
    uploadFormData.append("title", title);
    uploadFormData.append("description", description);
    uploadFormData.append("overview", overview);
    uploadFormData.append("image", image);
    uploadFormData.append("venue", venue);
    uploadFormData.append("location", location);
    uploadFormData.append("mode", mode);
    uploadFormData.append("audience", audience);
    uploadFormData.append("organizer", organizer);
    uploadFormData.append("eventStartAt", eventStartAt.toISOString());
    uploadFormData.append("tags", JSON.stringify(tagsArray));
    uploadFormData.append("agenda", JSON.stringify(agendaArray));

    // Call the existing API route
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${apiUrl}/api/events`, {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to create event",
      };
    }

    // Revalidate the events page to show the new event
    revalidatePath("/events");
    revalidatePath("/");

    return {
      success: true,
      message: "Event created successfully!",
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating the event",
    };
  }
}
